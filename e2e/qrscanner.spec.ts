import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('QR Scanner Guard', () => {
  test('admin dapat membuka halaman scan gate pass guard', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('./#/guard/gatepass-scan');

    await expect(page).toHaveURL(/\/guard\/gatepass-scan/);
    await expect(page.getByRole('heading', { name: 'Scan Gate Pass' })).toBeVisible();
    await expect(page.getByText(/Arahkan QR Gate Pass ke kamera/i)).toBeVisible();
  });

  test('container scanner ditampilkan', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('./#/guard/gatepass-scan');

    await expect(page.locator('#qr-guard-scanner')).toBeVisible();
  });
});
