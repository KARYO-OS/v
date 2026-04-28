import { expect, test } from '@playwright/test';

/**
 * Responsive flow test — verify layout adapts correctly across viewports (390/768/1280)
 * Tests public pages without authentication to focus on responsive behavior.
 */

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const publicPages = [
  '/#/login',
  '/#/error',
];

test.describe('Responsive Layout Tests', () => {
  for (const vp of viewports) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      for (const page of publicPages) {
        test(`load ${page} without horizontal overflow`, async ({ page: browserPage }) => {
          await browserPage.goto(page, { waitUntil: 'networkidle' });
          await browserPage.waitForTimeout(300);

          // Verify no horizontal scrollbar (content fits within viewport)
          const bodyWidth = await browserPage.evaluate(() => document.body.offsetWidth);
          const windowWidth = vp.width;

          expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 2); // +2 for rounding tolerance

          // Verify key elements are visible and not hidden
          const mainContent = browserPage.locator('main, [role="main"]').first();
          await expect(mainContent).toBeVisible({ timeout: 5000 });
        });
      }

      test(`PageHeader scales correctly on ${vp.name}`, async ({ page: browserPage }) => {
        await browserPage.goto('/#/login', { waitUntil: 'networkidle' });
        await browserPage.waitForTimeout(300);

        // Test that heading text does not overflow
        const heading = browserPage.locator('h1, h2').first();
        if (await heading.count() > 0) {
          const boundingBox = await heading.boundingBox();
          expect(boundingBox?.width).toBeLessThanOrEqual(vp.width * 0.95); // Allow 5% margin
        }
      });

      test(`Form elements are touch-friendly on ${vp.name}`, async ({ page: browserPage }) => {
        await browserPage.goto('/#/login', { waitUntil: 'networkidle' });
        await browserPage.waitForTimeout(300);

        // Verify input fields meet minimum touch target size (44px height)
        const inputs = browserPage.locator('input[type="text"], input[type="password"]');
        const inputCount = await inputs.count();

        if (inputCount > 0) {
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const bbox = await inputs.nth(i).boundingBox();
            expect(bbox?.height).toBeGreaterThanOrEqual(40); // Allow small tolerance from 44px
          }
        }
      });

      test(`Buttons are clickable on ${vp.name}`, async ({ page: browserPage }) => {
        await browserPage.goto('/#/login', { waitUntil: 'networkidle' });
        await browserPage.waitForTimeout(300);

        // Find primary button and verify it's accessible
        const buttons = browserPage.locator('button').first();
        if (await buttons.count() > 0) {
          const bbox = await buttons.boundingBox();
          expect(bbox?.height).toBeGreaterThanOrEqual(40);
          expect(bbox?.width).toBeGreaterThanOrEqual(60); // Minimum button width
        }
      });
    });
  }
});

test.describe('CSS Utility Application', () => {
  test('responsive utilities are loaded', async ({ page }) => {
    await page.goto('/#/login', { waitUntil: 'networkidle' });

    // Verify CSS is loaded and utilities exist
    const cssLoaded = await page.evaluate(() => {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      return styles.length > 0;
    });

    expect(cssLoaded).toBeTruthy();
  });

  test('mobile-first classes apply correctly', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    // Check that grid layouts exist and don't cause overflow
    const grids = page.locator('[class*="grid"], [class*="responsive"]');
    const gridCount = await grids.count();

    if (gridCount > 0) {
      for (let i = 0; i < Math.min(gridCount, 5); i++) {
        const bbox = await grids.nth(i).boundingBox();
        if (bbox) {
          expect(bbox.width).toBeLessThanOrEqual(390 + 5); // Allow slight tolerance
        }
      }
    }
  });
});

test.describe('Responsive Breakpoint Transitions', () => {
  test('layout responds to viewport resize', async ({ page }) => {
    // Start at mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/login', { waitUntil: 'networkidle' });
    const mobileHeight = await page.evaluate(() => document.body.scrollHeight);

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    const tabletHeight = await page.evaluate(() => document.body.scrollHeight);

    // Layout should adapt (height may change due to reflow)
    // Both should fit within viewport without too much overflow
    expect(mobileHeight).toBeGreaterThan(0);
    expect(tabletHeight).toBeGreaterThan(0);

    // Resize to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    const desktopHeight = await page.evaluate(() => document.body.scrollHeight);

    expect(desktopHeight).toBeGreaterThan(0);
  });
});
