/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots of critical pages and compare them
 * against baseline images to detect visual regressions.
 * 
 * Run with: pnpm test:e2e --project=visual-regression
 * 
 * To update baselines: pnpm test:e2e --project=visual-regression --update-snapshots
 */

import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Visual Regression - Critical Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Homepage visual regression', async ({ page }) => {
    await page.goto(baseURL);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Homepage - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Homepage - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Navigation header visual regression', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Find navigation element
    const nav = page.locator('nav, [role="navigation"], header').first();
    
    if (await nav.count() > 0) {
      await expect(nav).toHaveScreenshot('navigation-header.png', {
        animations: 'disabled',
      });
    } else {
      test.skip();
    }
  });
});

test.describe('Visual Regression - API Health Page', () => {
  test('Health endpoint visual (if HTML)', async ({ page }) => {
    await page.goto(`${baseURL}/api/healthz`);
    
    // Only take screenshot if it's HTML (not JSON)
    const contentType = await page.evaluate(() => {
      return document.contentType;
    });
    
    if (contentType?.includes('text/html')) {
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('health-endpoint.png', {
        fullPage: true,
        animations: 'disabled',
      });
    } else {
      test.skip();
    }
  });
});
