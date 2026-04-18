import { expect, test } from '@playwright/test';

const PRAJURIT_NRP = process.env.E2E_PRAJURIT_NRP;
const PRAJURIT_PIN = process.env.E2E_PRAJURIT_PIN;

async function loginAsPrajurit(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill(PRAJURIT_NRP ?? '');
  await page.locator('#pin').fill(PRAJURIT_PIN ?? '');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/prajurit\/dashboard/);
}

test.describe('Self Profile Edit', () => {
  test('prajurit dapat memperbarui data pribadi sendiri', async ({ page }) => {
    test.skip(!PRAJURIT_NRP || !PRAJURIT_PIN, 'Set E2E_PRAJURIT_NRP dan E2E_PRAJURIT_PIN untuk menjalankan test ini.');

    const suffix = Date.now().toString().slice(-6);
    const newBirthPlace = `Bandung-${suffix}`;
    const newPhone = `08123${suffix}`;
    const newEmergencyName = `Keluarga ${suffix}`;
    const newEmergencyPhone = `08987${suffix}`;

    await loginAsPrajurit(page);
    await page.goto('./#/prajurit/profile');

    await expect(page).toHaveURL(/\/prajurit\/profile/);
    await expect(page.getByRole('heading', { name: 'Profil Saya' }).first()).toBeVisible();

    await page.getByRole('button', { name: /Edit/i }).click();

    await page.getByLabel('Tempat Lahir').fill(newBirthPlace);
    await page.getByLabel('No. Telepon').fill(newPhone);
    await page.getByLabel('Kontak Darurat — Nama').fill(newEmergencyName);
    await page.getByLabel('Kontak Darurat — Telepon').fill(newEmergencyPhone);
    await page.getByLabel('Status Pernikahan').selectOption('menikah');

    await page.getByRole('button', { name: /^Simpan$/i }).click();

    await expect(page.getByText('Profil berhasil diperbarui')).toBeVisible();

    await page.reload();

    await expect(page.getByText(newBirthPlace).first()).toBeVisible();
    await expect(page.getByText(newPhone).first()).toBeVisible();
    await expect(page.getByText(newEmergencyName).first()).toBeVisible();
    await expect(page.getByText(newEmergencyPhone).first()).toBeVisible();
  });
});
