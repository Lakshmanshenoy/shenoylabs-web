#!/usr/bin/env node
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:3000/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    try {
      console.log(`[console:${msg.type()}] ${msg.text()}`);
    } catch (e) {
      console.log('[console] (error reading message)');
    }
  });

  page.on('pageerror', (err) => {
    console.error('[pageerror]', err && err.message ? err.message : err);
  });

  page.on('requestfailed', (req) => {
    const failure = req.failure();
    console.log('[requestfailed]', req.url(), failure ? failure.errorText : '');
  });

  page.on('response', (res) => {
    if (res.status() >= 400) console.log('[response]', res.status(), res.url());
  });

  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  // give the client a moment to run scripts
  await page.waitForTimeout(2500);
  console.log('Finished capture — closing browser.');
  await browser.close();
})();
