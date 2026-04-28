import fs from 'fs';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.setTimeout(0);

type RoleKey = 'admin' | 'komandan' | 'prajurit' | 'guard' | 'staf';
const ALL_ROLES: RoleKey[] = ['admin', 'komandan', 'prajurit', 'guard', 'staf'];

const ROLE_CREDENTIALS: Record<RoleKey, { nrp: string; pin: string; dashboardPath: string }> = {
  admin: {
    nrp: process.env.E2E_ADMIN_NRP ?? '1000001',
    pin: process.env.E2E_ADMIN_PIN ?? '123456',
    dashboardPath: '/admin/dashboard',
  },
  komandan: {
    nrp: process.env.E2E_KOMANDAN_NRP ?? '2000001',
    pin: process.env.E2E_KOMANDAN_PIN ?? '123456',
    dashboardPath: '/komandan/dashboard',
  },
  prajurit: {
    nrp: process.env.E2E_PRAJURIT_NRP ?? '3000001',
    pin: process.env.E2E_PRAJURIT_PIN ?? '123456',
    dashboardPath: '/prajurit/dashboard',
  },
  guard: {
    nrp: process.env.E2E_GUARD_NRP ?? '4000001',
    pin: process.env.E2E_GUARD_PIN ?? '123456',
    dashboardPath: '/guard/gatepass-scan',
  },
  staf: {
    nrp: process.env.E2E_STAF_NRP ?? '5000001',
    pin: process.env.E2E_STAF_PIN ?? '123456',
    dashboardPath: '/staf/dashboard',
  },
};

const ROUTES_BY_ROLE: Record<RoleKey, string[]> = {
  admin: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/announcements',
    '/admin/settings',
    '/admin/gatepass-monitor',
    '/admin/pos-jaga',
  ],
  komandan: [
    '/komandan/dashboard',
    '/komandan/tasks',
    '/komandan/personnel',
    '/komandan/gatepass-monitor',
  ],
  prajurit: [
    '/prajurit/dashboard',
    '/prajurit/tasks',
    '/prajurit/profile',
    '/prajurit/gatepass',
  ],
  guard: [
    '/guard/gatepass-scan',
    '/guard/discipline',
  ],
  staf: [
    '/staf/dashboard',
    '/staf/messages',
  ],
};

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

async function loginAsRole(page: Page, role: RoleKey): Promise<void> {
  const { nrp, pin, dashboardPath } = ROLE_CREDENTIALS[role];
  await page.goto('./#/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#nrp').fill(nrp);
  await page.locator('#pin').fill(pin);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(new RegExp(dashboardPath));
}

async function captureRoutes(context: BrowserContext, role: RoleKey, viewportName: string, width: number, height: number): Promise<void> {
  const dir = `test-results/screenshots/${viewportName}/${role}`;
  fs.mkdirSync(dir, { recursive: true });

  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  await loginAsRole(page, role);

  for (const route of ROUTES_BY_ROLE[role]) {
    const hashPath = `/#${route}`.replace(/\/\/+/, '/');
    await page.goto(hashPath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const name = route.replace(/\//g, '_').replace(/^_/, '') || 'root';
    const filename = `${dir}/${name}-${width}x${height}.png`;
    await page.screenshot({ path: filename, fullPage: true });
    console.log('Saved', filename);
  }

  // Also capture shared public error page for each role context.
  await page.goto('/#/error', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const errorFile = `${dir}/error-${width}x${height}.png`;
  await page.screenshot({ path: errorFile, fullPage: true });
  console.log('Saved', errorFile);

  await page.close();
}

test('capture screenshots for main routes with authenticated roles', async ({ browser }) => {
  fs.rmSync('test-results/screenshots', { recursive: true, force: true });
  fs.mkdirSync('test-results/screenshots', { recursive: true });

  const selectedRoles = (process.env.E2E_SCREENSHOT_ROLES
    ? process.env.E2E_SCREENSHOT_ROLES.split(',').map((r) => r.trim().toLowerCase())
    : ALL_ROLES
  ).filter((role): role is RoleKey => ALL_ROLES.includes(role as RoleKey));

  if (selectedRoles.length === 0) {
    throw new Error('No valid role selected. Set E2E_SCREENSHOT_ROLES to: admin,komandan,prajurit,guard,staf');
  }

  for (const vp of viewports) {
    for (const role of selectedRoles) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await captureRoutes(context, role, vp.name, vp.width, vp.height);
      await context.close();
    }
  }
});
