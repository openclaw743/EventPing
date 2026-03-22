import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for EventPing E2E tests.
 *
 * Environment variables:
 *   BASE_URL          — frontend origin (default: http://localhost:5173)
 *   BACKEND_URL       — backend origin  (default: http://localhost:3000)
 *   TEST_EVENT_SLUG   — pre-existing event slug used by e2e tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Start frontend and backend servers automatically in CI */
  // webServer: [
  //   {
  //     command: 'npm run dev --workspace=frontend',
  //     url: 'http://localhost:5173',
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run dev --workspace=backend',
  //     url: 'http://localhost:3000/health',
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
});
