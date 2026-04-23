/**
 * Utilities untuk formatting waktu/tanggal
 * Digunakan konsisten di seluruh aplikasi untuk gate pass dan fitur terkait
 */

/**
 * Format waktu dalam format "HH:mm" (jam:menit)
 * @param waktuString ISO datetime string atau Date
 * @returns Contoh: "14:30" atau "—" jika invalid
 */
export function formatTimeOnly(waktuString?: string | null): string {
  if (!waktuString) return '—';
  try {
    const date = new Date(waktuString);
    if (isNaN(date.getTime())) return '—';
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
  } catch {
    return '—';
  }
}

/**
 * Format waktu dalam format "HH:mm (DD Mon)"
 * @param waktuString ISO datetime string atau Date
 * @returns Contoh: "14:30 (25 Apr)" atau "—" jika invalid
 */
export function formatTimeWithDate(waktuString?: string | null): string {
  if (!waktuString) return '—';
  try {
    const date = new Date(waktuString);
    if (isNaN(date.getTime())) return '—';

    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    const hari = String(date.getDate()).padStart(2, '0');
    const bulanNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const bulan = bulanNames[date.getMonth()] || '—';

    return `${jam}:${menit} (${hari} ${bulan})`;
  } catch {
    return '—';
  }
}

/**
 * Format waktu lengkap dengan tanggal dan hari
 * @param waktuString ISO datetime string atau Date
 * @returns Contoh: "Selasa, 25 April 2026 14:30"
 */
export function formatFullDateTime(waktuString?: string | null): string {
  if (!waktuString) return '—';
  try {
    const date = new Date(waktuString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Format tanggal saja (tanpa waktu)
 * @param waktuString ISO datetime string atau Date
 * @returns Contoh: "25 April 2026"
 */
export function formatDateOnly(waktuString?: string | null): string {
  if (!waktuString) return '—';
  try {
    const date = new Date(waktuString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Get relative time (e.g., "dalam 2 jam", "24 menit lalu")
 * Berguna untuk menampilkan waktu scan dengan konteks real-time
 */
export function formatRelativeTime(waktuString?: string | null): string {
  if (!waktuString) return '—';
  try {
    const date = new Date(waktuString);
    if (isNaN(date.getTime())) return '—';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 0) {
      const futureMin = Math.abs(diffMins);
      return `dalam ${futureMin} menit`;
    }
    if (diffMins === 0) return 'baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDateOnly(waktuString);
  } catch {
    return '—';
  }
}

/**
 * Helper untuk display durasi antara dua waktu
 * @returns Contoh: "4 jam 30 menit"
 */
export function formatDuration(startTime?: string | null, endTime?: string | null): string {
  if (!startTime || !endTime) return '—';
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '—';

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '0 menit'; // end sebelum start

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);

    if (hours === 0) return `${minutes} menit`;
    if (minutes === 0) return `${hours} jam`;
    return `${hours} jam ${minutes} menit`;
  } catch {
    return '—';
  }
}
