import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Configuration
 * 
 * Supports:
 * - E2E testing
 * - Visual regression testing
 * - Cross-browser testing
 * - Accessibility testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Test timeout
  timeout: 30 * 1000,
  expect: {
    // Timeout for assertions
    timeout: 5 * 1000,
    // Threshold for visual comparisons
    toHaveScreenshot: {
      threshold: 0.2, // 20% pixel difference allowed
      maxDiffPixels: 100, // Max different pixels
    },
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixels: 100,
    },
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: process.env.CI
    ? [
        ['html'],
        ['json', { outputFile: 'playwright-report/results.json' }],
        ['junit', { outputFile: 'playwright-report/junit.xml' }],
      ]
    : [['html'], ['list']],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Visual regression - single browser for consistency
    {
      name: 'visual-regression',
      use: { 
        ...devices['Desktop Chrome'],
        // Use consistent viewport for visual tests
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: /.*\.visual\.spec\.ts/,
    },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI
    ? undefined // In CI, server should already be running
    : {
        command: 'pnpm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
      },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
});
