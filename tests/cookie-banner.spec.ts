import { test, expect } from '@playwright/test';

test('cookie banner focus and consent POST', async ({ page }) => {
  // Use baseURL from config
  await page.goto('/', { waitUntil: 'networkidle' });

  const banner = page.getByRole('region', { name: 'Cookie consent' });
  await banner.waitFor({ state: 'visible', timeout: 5000 });

  const accept = page.getByRole('button', { name: 'Accept' });
  await expect(accept).toBeFocused();

  const reqPromise = page.waitForRequest(
    (req) => req.url().endsWith('/api/consent') && req.method() === 'POST',
    { timeout: 5000 },
  );

  await accept.click();

  const req = await reqPromise;
  const headers = req.headers();
  const contentType = headers['content-type'] || headers['Content-Type'] || '';
  expect(contentType).toContain('application/json');

  const postData = req.postData() || '';
  const data = JSON.parse(postData);
  expect(data.action).toBe('grant');
  expect(data.type).toBe('analytics');
});
