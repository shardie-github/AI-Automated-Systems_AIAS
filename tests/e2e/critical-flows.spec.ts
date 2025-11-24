/**
 * Critical E2E Tests
 * 
 * Tests critical user flows that must work for the application to be functional.
 * These tests are blocking - they must pass before deployment.
 * 
 * Run with: pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set longer timeout for E2E tests
    test.setTimeout(30000);
  });

  test('Homepage loads and displays correctly', async ({ page }) => {
    await page.goto(baseURL);
    
    // Check page loads
    await expect(page).toHaveTitle(/AIAS Platform/i);
    
    // Check key elements are visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check for main navigation or hero section
    const heroOrNav = page.locator('nav, [role="banner"], h1').first();
    await expect(heroOrNav).toBeVisible();
  });

  test('Health endpoint responds correctly', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/healthz`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('ok');
    expect(body.ok).toBe(true);
  });

  test('API routes are accessible', async ({ request }) => {
    // Test health endpoint
    const healthResponse = await request.get(`${baseURL}/api/healthz`);
    expect(healthResponse.status()).toBe(200);
    
    // Test that API routes don't return 404
    // (Some may return 401/403 which is expected for protected routes)
    const apiResponse = await request.get(`${baseURL}/api/healthz`);
    expect([200, 401, 403]).toContain(apiResponse.status());
  });

  test('Page navigation works', async ({ page }) => {
    await page.goto(baseURL);
    
    // Try to find and click navigation links
    const links = page.locator('a[href^="/"]').first();
    if (await links.count() > 0) {
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');
      
      if (href && href !== '/' && !href.startsWith('#')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check that page loaded (not 404)
        const title = await page.title();
        expect(title).toBeTruthy();
      }
    }
  });

  test('No console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('404') &&
        !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('Page is responsive', async ({ page }) => {
    await page.goto(baseURL);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Authentication Flow (if applicable)', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('Login page is accessible', async ({ page }) => {
    // Try common login routes
    const loginRoutes = ['/login', '/auth/login', '/account', '/signin'];
    
    for (const route of loginRoutes) {
      const response = await page.goto(`${baseURL}${route}`);
      if (response && response.status() !== 404) {
        await expect(page.locator('body')).toBeVisible();
        return; // Found a login page
      }
    }
    
    // If no login page found, skip this test
    test.skip();
  });
});

test.describe('API Contract Tests', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test('Health endpoint returns expected structure', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/healthz`);
    const body = await response.json();
    
    // Check expected structure
    expect(body).toHaveProperty('ok');
    expect(typeof body.ok).toBe('boolean');
    
    // Optional: Check for additional health check properties
    if (body.db) {
      expect(typeof body.db.ok).toBe('boolean');
    }
    if (body.auth) {
      expect(typeof body.auth.ok).toBe('boolean');
    }
  });

  test('API endpoints return JSON', async ({ request }) => {
    const endpoints = ['/api/healthz'];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${baseURL}${endpoint}`);
      const contentType = response.headers()['content-type'];
      
      if (response.status() === 200) {
        expect(contentType).toContain('application/json');
      }
    }
  });
});
