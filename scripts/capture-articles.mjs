#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const outDir = path.join(process.cwd(), 'public', 'blueprint-assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

  const port = process.env.PORT || '3000';
  const pages = [
    { url: '/articles/website-blueprint-integrations', name: 'blueprint' },
    { url: '/articles/how-to-build-a-website-with-almost-no-cost', name: 'almost-no-cost' },
  ];

  for (const p of pages) {
    const url = `http://localhost:${port}${p.url}`;
    console.log('Visiting', url);
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        loaded = true;
        break;
      } catch (e) {
        process.stdout.write('.');
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    if (!loaded) {
      console.error(`\nFailed to load ${url}`);
      continue;
    }
    try {
      await page.waitForSelector('article, header, h1', { timeout: 15000 });
    } catch (e) {}
    const outPath = path.join(outDir, `screenshot-${p.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('Saved', outPath);
  }

  await browser.close();
  console.log('Done');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
