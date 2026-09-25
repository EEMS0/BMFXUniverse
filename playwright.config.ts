import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against a production build (`npm run build` first).
 * They use the locally installed Chrome (channel "chrome"), so no browser
 * download is needed; set PW_CHANNEL=msedge to use Edge instead.
 */
const port = Number(process.env.E2E_PORT ?? 3100)
const channel = process.env.PW_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
    channel,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], channel, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        port,
        reuseExistingServer: true,
        timeout: 120_000,
        // Email credentials are deliberately absent so the real "not configured" path is exercised.
        env: { RESEND_API_KEY: '', ENQUIRY_FROM_EMAIL: '', ENQUIRY_TO_EMAIL: '' },
      },
})
