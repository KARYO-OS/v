import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('User Management', () => {
  test('halaman manajemen personel tampil dengan kontrol utama', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('./#/admin/users');

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole('heading', { name: 'Manajemen Personel' }).first()).toBeVisible();
    await expect(page.getByPlaceholder('Cari nama atau NRP...')).toBeVisible();
    await expect(page.getByRole('button', { name: /Import CSV/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tambah Personel/i })).toBeVisible();
    await expect(page.getByText('NRP').first()).toBeVisible();
  });

  test('modal tambah personel dapat dibuka dan dibatalkan', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('./#/admin/users');

    await page.getByRole('button', { name: /Tambah Personel/i }).click();

    await expect(page.getByRole('heading', { name: 'Tambah Personel Baru' })).toBeVisible();
    await expect(page.getByLabel('NRP *')).toBeVisible();
    await expect(page.getByLabel('Nama Lengkap *')).toBeVisible();
    await expect(page.getByLabel('Satuan *')).toBeVisible();
    await expect(page.getByLabel('PIN Awal *')).toBeVisible();

    await page.getByRole('button', { name: 'Batal' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah Personel Baru' })).not.toBeVisible();
  });
});
