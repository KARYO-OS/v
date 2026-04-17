import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('Logistics', () => {
  test('halaman logistik menampilkan tab dan kontrol inventaris', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('./#/admin/logistics');

    await expect(page).toHaveURL(/\/admin\/logistics/);
    await expect(page.getByRole('heading', { name: 'Manajemen Logistik' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Tambah Item/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Inventaris/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Permintaan/i })).toBeVisible();
    await expect(page.getByPlaceholder('Cari item...')).toBeVisible();
  });

  test('modal tambah item logistik dapat dibuka dan dibatalkan', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('./#/admin/logistics');

    await page.getByRole('button', { name: /Tambah Item/i }).click();

    await expect(page.getByRole('heading', { name: 'Tambah Item Logistik' })).toBeVisible();
    await expect(page.getByLabel('Nama Item *')).toBeVisible();
    await expect(page.getByLabel('Kategori')).toBeVisible();
    await expect(page.getByLabel('Jumlah')).toBeVisible();

    await page.getByRole('button', { name: 'Batal' }).click();
    await expect(page.getByRole('heading', { name: 'Tambah Item Logistik' })).not.toBeVisible();
  });

  test('tab permintaan dapat dibuka', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('./#/admin/logistics');

    await page.getByRole('button', { name: /Permintaan/i }).click();

    const emptyState = page.getByText('Belum ada permintaan logistik dari Komandan');
    if (await emptyState.count()) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(page.getByText(/Jumlah:|Satuan:/).first()).toBeVisible();
    }
  });
});
