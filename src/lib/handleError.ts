import { recordApiError } from './metrics';

/**
 * handleError — Standar penanganan error di seluruh aplikasi Karyo OS.
 *
 * Penggunaan:
 *   catch (err) { setError(handleError(err, 'Gagal memuat data', 'fetchTasks')); }
 *
 * Di mode development, error asli dicetak ke console agar mudah di-debug.
 * Di production, hanya pesan user-friendly yang ditampilkan.
 *
 * @param err       Error yang ditangkap dari catch block
 * @param fallback  Pesan user-friendly jika err bukan Error instance
 * @param operation Nama operasi opsional — jika diberikan, error dicatat ke
 *                  metrics sehingga `window.__karyoDebug.logMetrics()` bisa
 *                  menampilkan operasi mana yang paling sering gagal.
 */
export function handleError(err: unknown, fallback: string, operation?: string): string {
  const message = err instanceof Error && err.message ? err.message : fallback;
  if (import.meta.env.DEV) {
    console.error('[KARYO OS]', operation ? `[${operation}]` : '', err);
  }
  if (operation) {
    recordApiError(operation, message);
  }
  return message;
}
