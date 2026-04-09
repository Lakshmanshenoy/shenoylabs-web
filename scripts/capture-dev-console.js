const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const logs = [];
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', (msg) => {
      const text = `[console.${msg.type()}] ${msg.text()}`;
      logs.push(text);
      console.log(text);
    });

    page.on('pageerror', (err) => {
      const text = `[pageerror] ${err.message}`;
      logs.push(text);
      console.log(text);
    });

    page.on('requestfailed', (req) => {
      const failure = req.failure();
      const text = `[requestfailed] ${req.url()} ${failure ? failure.errorText : 'unknown'}`;
      logs.push(text);
      console.log(text);
    });

    // Visit root and a couple of pages to trigger HMR/runtime client behaviors
    const urls = ['http://localhost:3000', 'http://localhost:3000/articles', 'http://localhost:3000/articles/building-in-public'];
    for (const u of urls) {
      try {
        console.log(`visiting ${u}`);
        await page.goto(u, { waitUntil: 'load', timeout: 20000 });
      } catch (e) {
        const text = `[goto error] ${u} -> ${e.message}`;
        logs.push(text);
        console.log(text);
      }
      // small wait after navigation
      await page.waitForTimeout(4000);
    }

    // Let the page run for a bit to surface HMR/ChunkLoadError messages
    // reload repeatedly to provoke any missing-chunk loads while HMR pulses run
    for (let r = 0; r < 6; r++) {
      try {
        await page.reload({ waitUntil: 'load' });
      } catch (e) {
        const text = `[reload error] ${e.message}`;
        logs.push(text);
        console.log(text);
      }
      await page.waitForTimeout(7000);
    }

    await browser.close();
  } catch (err) {
    logs.push(`[script error] ${err.message}`);
    console.error(err);
  } finally {
    try {
      fs.writeFileSync('dev-console.log', logs.join('\n'), 'utf8');
      console.log('Wrote dev-console.log');
    } catch (e) {
      console.error('Failed to write log:', e.message);
    }
  }
})();
