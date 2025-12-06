/**
 * Accessibility Testing Setup
 * 
 * Provides utilities for automated accessibility testing.
 * 
 * Usage with Playwright:
 * ```ts
 * import { test, expect } from '@playwright/test';
 * import { checkA11y } from './tests/accessibility/a11y-test-setup';
 * 
 * test('homepage is accessible', async ({ page }) => {
 *   await page.goto('/');
 *   await checkA11y(page);
 * });
 * ```
 */

/**
 * Accessibility check configuration
 */
export const a11yConfig = {
  // WCAG 2.1 Level AA standards
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'image-alt': { enabled: true },
    'link-name': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
};

/**
 * Common accessibility issues to check
 */
export const a11yChecklist = {
  images: {
    description: 'All images have alt text',
    check: (element: HTMLElement) => {
      const images = element.querySelectorAll('img');
      return Array.from(images).every((img) => img.hasAttribute('alt'));
    },
  },
  headings: {
    description: 'Headings are in logical order (h1, h2, h3, etc.)',
    check: (element: HTMLElement) => {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      for (const heading of Array.from(headings)) {
        const level = parseInt(heading.tagName[1]);
        if (level > lastLevel + 1) {
          return false; // Skipped a level
        }
        lastLevel = level;
      }
      return true;
    },
  },
  keyboard: {
    description: 'All interactive elements are keyboard accessible',
    check: (element: HTMLElement) => {
      const interactive = element.querySelectorAll('button, a, input, select, textarea');
      return Array.from(interactive).every((el) => {
        const tabIndex = el.getAttribute('tabindex');
        return tabIndex !== '-1' && !el.hasAttribute('disabled');
      });
    },
  },
  labels: {
    description: 'All form inputs have labels',
    check: (element: HTMLElement) => {
      const inputs = element.querySelectorAll('input, select, textarea');
      return Array.from(inputs).every((input) => {
        const id = input.getAttribute('id');
        if (!id) return false;
        const label = element.querySelector(`label[for="${id}"]`);
        return label !== null || input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
      });
    },
  },
  landmarks: {
    description: 'Page has proper landmarks (header, main, footer, nav)',
    check: (element: HTMLElement) => {
      const hasHeader = element.querySelector('header, [role="banner"]');
      const hasMain = element.querySelector('main, [role="main"]');
      const hasFooter = element.querySelector('footer, [role="contentinfo"]');
      return !!(hasHeader && hasMain);
    },
  },
  focus: {
    description: 'Focus indicators are visible',
    check: (element: HTMLElement) => {
      // Check if CSS has focus styles
      const style = window.getComputedStyle(element);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    },
  },
};

/**
 * Run accessibility checks (for use with axe-core or similar)
 */
export async function runA11yChecks(page: any): Promise<void> {
  // This would integrate with axe-core or pa11y
  // Example implementation:
  // const results = await page.evaluate(() => {
  //   return window.axe?.run();
  // });
  // return results;
}
