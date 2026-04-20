import { expect, test } from '@playwright/test';

async function loginAsKomandan(page: import('@playwright/test').Page) {
	await page.goto('./#/login');
	await page.locator('#nrp').fill('2000001');
	await page.locator('#pin').fill('123456');
	await page.getByRole('button', { name: 'Masuk' }).click();
	await expect(page).toHaveURL(/\/komandan\/dashboard/);
}

test.describe('Gate Pass Approval Komandan', () => {
	test('halaman approval menampilkan judul dan seksi operasional', async ({ page }) => {
		await loginAsKomandan(page);

		await page.goto('./#/komandan/gatepass-approval');

		await expect(page).toHaveURL(/\/komandan\/gatepass-approval/);
		await expect(page.getByRole('heading', { name: 'Approval Gate Pass' })).toBeVisible();
		await expect(page.getByText(/Status Operasional/i)).toBeVisible();
	});
});
