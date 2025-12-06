/**
 * Accessibility E2E Tests
 * 
 * Automated accessibility testing using Playwright and axe-core.
 */

import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core into the page
    await injectAxe(page);
  });

  test("homepage should be accessible", async ({ page }) => {
    await page.goto("/");
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("signup page should be accessible", async ({ page }) => {
    await page.goto("/signup");
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("blog page should be accessible", async ({ page }) => {
    await page.goto("/blog");
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("pricing page should be accessible", async ({ page }) => {
    await page.goto("/pricing");
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("keyboard navigation should work", async ({ page }) => {
    await page.goto("/");
    
    // Tab through interactive elements
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
    
    // Check skip link appears on focus
    const skipLink = page.locator(".skip-link");
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/");
    
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });

  test("forms should have labels", async ({ page }) => {
    await page.goto("/signup");
    
    const inputs = await page.locator("input, select, textarea").all();
    for (const input of inputs) {
      const id = await input.getAttribute("id");
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");
        
        expect(
          (await label.count()) > 0 || ariaLabel || ariaLabelledBy
        ).toBeTruthy();
      }
    }
  });

  test("headings should be in logical order", async ({ page }) => {
    await page.goto("/");
    
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    let lastLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      const level = parseInt(tagName[1]);
      
      // Headings should not skip levels
      expect(level).toBeLessThanOrEqual(lastLevel + 1);
      lastLevel = level;
    }
  });

  test("color contrast should meet WCAG AA", async ({ page }) => {
    await page.goto("/");
    
    // This would require additional tooling to check actual contrast ratios
    // For now, we rely on axe-core to catch contrast issues
    await checkA11y(page, undefined, {
      rules: {
        "color-contrast": { enabled: true },
      },
    });
  });
});
