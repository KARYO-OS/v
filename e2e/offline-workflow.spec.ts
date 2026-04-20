import { expect, test } from '@playwright/test';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('./#/login');
  await page.locator('#nrp').fill(process.env.E2E_ADMIN_NRP ?? '1000001');
  await page.locator('#pin').fill(process.env.E2E_ADMIN_PIN ?? '123456');
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

async function seedQueueOperation(page: import('@playwright/test').Page, status: 'pending' | 'failed') {
  await page.evaluate(async (opStatus) => {
    const openWithVersion = (version?: number) =>
      new Promise<IDBDatabase>((resolve, reject) => {
        const request = version ? indexedDB.open('KaryoOS', version) : indexedDB.open('KaryoOS');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('queued_operations')) {
            const queueStore = db.createObjectStore('queued_operations', { keyPath: 'id' });
            queueStore.createIndex('by-timestamp', 'timestamp');
            queueStore.createIndex('by-status', 'status');
            queueStore.createIndex('by-entity_type', 'entity_type');
          }
        };
      });

    let db = await openWithVersion();

    if (!db.objectStoreNames.contains('queued_operations')) {
      const nextVersion = db.version + 1;
      db.close();
      db = await openWithVersion(nextVersion);
    }

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('queued_operations', 'readwrite');
      const store = tx.objectStore('queued_operations');
      store.put({
        id: `e2e-op-${Date.now()}`,
        timestamp: Date.now(),
        retry_count: opStatus === 'failed' ? 5 : 0,
        max_retries: 5,
        operation_type: 'CREATE',
        entity_type: 'tasks',
        payload: { title: 'E2E Offline Operation' },
        error: opStatus === 'failed' ? 'forced failure' : undefined,
        status: opStatus,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }, status);
}

test.describe('Offline workflow', () => {
  test('menampilkan status offline dan antrean sinkronisasi', async ({ page }) => {
    await loginAsAdmin(page);

    const statusBadge = page.locator('header').locator('span').filter({ hasText: /Online|Sinkronisasi|Offline/ }).first();
    await expect(statusBadge).toBeVisible();

    await seedQueueOperation(page, 'pending');

    await page.evaluate(() => {
      navigator.serviceWorker?.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'SYNC_COMPLETE',
            pending: 1,
            failed: 0,
            synced: 0,
          },
        })
      );
    });

    const queueBadge = page.getByRole('button', { name: /Sinkronisasi 1 operasi tertunda/i });
    await expect(queueBadge).toBeVisible();

    await page.evaluate(() => {
      navigator.serviceWorker?.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'ONLINE_STATUS_CHANGED',
            isOnline: false,
          },
        })
      );
    });

    await expect(page.locator('header').getByText('Offline', { exact: true })).toBeVisible();
    await expect(queueBadge).toBeDisabled();

    await page.evaluate(() => {
      navigator.serviceWorker?.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'ONLINE_STATUS_CHANGED',
            isOnline: true,
          },
        })
      );
    });

    await expect(page.locator('header').getByText('Offline', { exact: true })).toHaveCount(0);
    await expect(page.locator('header').getByText(/Online|Sinkronisasi/)).toBeVisible();
  });

  test('menampilkan badge gagal sinkronisasi dan tombol retry', async ({ page }) => {
    await loginAsAdmin(page);

    await seedQueueOperation(page, 'failed');

    await page.evaluate(() => {
      navigator.serviceWorker?.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'SYNC_COMPLETE',
            pending: 0,
            failed: 1,
            synced: 0,
          },
        })
      );
    });

    const failedQueueBadge = page.getByRole('button', { name: /Sinkronisasi ulang 1 operasi gagal/i });
    await expect(failedQueueBadge).toBeVisible();
    await expect(failedQueueBadge).toBeEnabled();

    await failedQueueBadge.click();

    await expect(failedQueueBadge).toBeVisible();
  });
});
