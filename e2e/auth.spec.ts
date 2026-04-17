import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('Auth', () => {
  test('redirect ke login saat akses route terproteksi tanpa sesi', async ({ page }) => {
    await page.goto('./#/admin/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Masuk ke Sistem' })).toBeVisible();
  });

  test('validasi PIN 6 digit ditampilkan di login form', async ({ page }) => {
    await page.goto('./#/login');
    await page.locator('#nrp').fill('1000001');
    await page.locator('#pin').fill('123');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page.getByRole('alert')).toContainText(/PIN harus 6 digit angka/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout mengembalikan user ke halaman login', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Keluar' }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Masuk ke Sistem' })).toBeVisible();
  });
});
