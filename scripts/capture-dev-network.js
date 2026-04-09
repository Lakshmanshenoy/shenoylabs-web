const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const out = fs.createWriteStream(path.resolve(process.cwd(), 'dev-console-network.log'), { flags: 'a' });
  const url = process.env.URL || 'http://localhost:3000';
  const runMs = parseInt(process.env.RUN_MS || '45000', 10);

  out.write(`\n=== Capture started: ${new Date().toISOString()} url=${url} runMs=${runMs} ===\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    try {
      out.write(`[console.${msg.type()}] ${msg.text()}\n`);
    } catch (e) {
      out.write(`[console] ${String(msg)}\n`);
    }
  });

  page.on('pageerror', (err) => {
    out.write(`[pageerror] ${err.stack || err.message || String(err)}\n`);
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    const failure = request.failure();
    out.write(`[requestfailed] ${request.method()} ${url} - ${JSON.stringify(failure)}\n`);
  });

  page.on('response', async (response) => {
    try {
      const req = response.request();
      const url = response.url();
      const status = response.status();
      if (url.includes('/_next/static/chunks') || status >= 400) {
        out.write(`[response] ${req.method()} ${url} -> ${status}\n`);
        // attempt to read text for 4xx/5xx
        if (status >= 400) {
          try {
            const text = await response.text();
            out.write(`[response-body] ${url} -> ${text.slice(0, 2000)}\n`);
          } catch (e) {
            out.write(`[response-body] ${url} -> <could not read> ${e.message}\n`);
          }
        }
      }
    } catch (e) {
      out.write(`[response] error reading response: ${e.message}\n`);
    }
  });

  // also capture failed resource requests
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('/_next/static/chunks')) {
      out.write(`[request] ${req.method()} ${u}\n`);
    }
  });

  // visit the page and wait for network idle
  try {
    out.write(`[navigation] goto ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle' });
    out.write(`[navigation] initial load done\n`);
  } catch (e) {
    out.write(`[navigation-error] ${e.stack || e.message}\n`);
  }

  // keep the page open for runMs while collecting events
  out.write(`[capture] collecting for ${runMs}ms\n`);
  await new Promise((res) => setTimeout(res, runMs));

  out.write(`[capture] finishing capture ${new Date().toISOString()}\n`);
  await browser.close();
  out.end();
  console.log('Capture complete: dev-console-network.log');
})();
