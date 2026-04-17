import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('Global Search', () => {
  test('modal search dapat dibuka dari tombol', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Cari (Ctrl+K)' }).click();

    await expect(page.getByPlaceholder('Cari tugas, personel, pengumuman...')).toBeVisible();
  });

  test('search menampilkan empty-state saat query tidak ditemukan', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Cari (Ctrl+K)' }).click();
    const input = page.getByPlaceholder('Cari tugas, personel, pengumuman...');
    await input.fill('zzztidakadahasil123');

    await expect(page.getByText(/Tidak ada hasil untuk/i)).toBeVisible();
  });

  test('escape menutup modal search', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('button', { name: 'Cari (Ctrl+K)' }).click();
    await expect(page.getByPlaceholder('Cari tugas, personel, pengumuman...')).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(page.getByPlaceholder('Cari tugas, personel, pengumuman...')).not.toBeVisible();
  });
});
