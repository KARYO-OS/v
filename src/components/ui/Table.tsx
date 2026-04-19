import type { ReactNode } from 'react';
import EmptyState from '../common/EmptyState';

/** Definisi satu kolom tabel */
interface Column<T> {
  /** Key dari objek data, atau string custom jika menggunakan `render` */
  key: keyof T | string;
  /** Judul kolom yang ditampilkan di header */
  header: ReactNode;
  /** Render custom untuk cell. Jika tidak ada, nilai diambil dari `row[key]` */
  render?: (row: T) => ReactNode;
  /** Class CSS tambahan untuk kolom (header dan cell) */
  className?: string;
}

/**
 * Table — komponen tabel generik yang dapat digunakan di seluruh aplikasi.
 *
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'nama', header: 'Nama' },
 *     { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
 *   ]}
 *   data={users}
 *   keyExtractor={(u) => u.id}
 *   isLoading={isLoading}
 *   emptyMessage="Tidak ada pengguna"
 * />
 * ```
 */
interface TableProps<T> {
  /** Definisi kolom-kolom tabel */
  columns: Column<T>[];
  /** Data yang ditampilkan */
  data: T[];
  /** Fungsi untuk mendapatkan key unik per baris (biasanya `id`) */
  keyExtractor: (row: T) => string;
  /** Tampilkan skeleton loading jika true */
  isLoading?: boolean;
  /** Pesan yang ditampilkan saat data kosong */
  emptyMessage?: string;
  /** Deskripsi aksesibel untuk tabel — dirender sebagai caption tersembunyi */
  caption?: string;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'Tidak ada data',
  caption,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="app-panel overflow-hidden rounded-2xl border border-surface/70">
        <div className="border-b border-surface/70 px-4 py-3 text-xs text-text-muted sm:px-5">Memuat data tabel...</div>
        <div className="space-y-3 p-4 sm:p-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="grid gap-3 rounded-xl border border-surface/60 bg-bg-card px-4 py-3 sm:grid-cols-[1.2fr_1fr_0.8fr_1fr]">
              <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-surface/70" />
              <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-surface/70" />
              <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-surface/70" />
              <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-surface/70" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-panel overflow-hidden rounded-2xl">
      <div className="border-b border-surface/70 px-4 py-2 text-[11px] text-text-muted sm:hidden">
        Geser tabel ke samping untuk melihat semua kolom
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-[1]">
            <tr className="border-b border-surface bg-slate-50/95 backdrop-blur-sm dark:bg-surface/45">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted sm:px-5 ${col.className ?? ''}`}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-12 text-center sm:px-5">
                  <EmptyState
                    title="Data belum tersedia"
                    description={emptyMessage}
                    className="border-0 bg-transparent px-0 py-0"
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="transition-colors hover:bg-slate-50 dark:hover:bg-surface/25">
                  {columns.map((col) => (
                    <td key={String(col.key)} className={`px-3 py-3 text-xs text-text-primary sm:px-5 sm:py-4 sm:text-sm ${col.className ?? ''}`}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
