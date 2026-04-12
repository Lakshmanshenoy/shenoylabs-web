import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3001',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'pnpm build && PORT=3001 pnpm start',
    url: 'http://localhost:3001',
    timeout: 120_000,
    reuseExistingServer: !!process.env.CI === false,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
