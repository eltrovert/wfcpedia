import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Mobile-first testing (primary focus)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }, // Primary mobile viewport
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'Android Mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
    },

    // Desktop fallback testing
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Accessibility testing
    {
      name: 'Accessibility Tests',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 }, // Test a11y on mobile viewport
      },
      testMatch: /.*accessibility\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
  },
})
