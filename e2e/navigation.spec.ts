import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill('1000001');
  await page.locator('#pin').fill('123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('Navigation', () => {
  test('sidebar admin menavigasi ke halaman personel', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('link', { name: 'Personel' }).first().click();

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByRole('heading', { name: 'Manajemen Personel' }).first()).toBeVisible();
  });

  test('sidebar admin menavigasi ke halaman logistik', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('link', { name: 'Logistik' }).first().click();

    await expect(page).toHaveURL(/\/admin\/logistics/);
    await expect(page.getByRole('heading', { name: 'Manajemen Logistik' }).first()).toBeVisible();
  });

  test('sidebar admin menavigasi ke monitoring gate pass', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('link', { name: 'Gate Pass' }).first().click();

    await expect(page).toHaveURL(/\/admin\/gatepass-monitor/);
    await expect(page.getByRole('heading', { name: 'Monitoring Gate Pass' })).toBeVisible();
  });
});
