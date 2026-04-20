interface SyncQueueBadgeProps {
  pending: number;
  failed: number;
  isSyncing: boolean;
  isOnline: boolean;
  onSync: () => void;
}

export default function SyncQueueBadge({
  pending,
  failed,
  isSyncing,
  isOnline,
  onSync,
}: SyncQueueBadgeProps) {
  if (pending === 0 && failed === 0) return null;

  const hasFailed = failed > 0;

  return (
    <button
      type="button"
      onClick={onSync}
      disabled={isSyncing || !isOnline}
      className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
        hasFailed
          ? 'border-red-200 bg-red-50/90 text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-accent-red/35 dark:bg-accent-red/16 dark:text-accent-red'
          : 'border-blue-200 bg-blue-50/90 text-blue-700 hover:bg-blue-100 disabled:opacity-60 dark:border-primary/35 dark:bg-primary/16 dark:text-primary'
      }`}
      title={
        hasFailed
          ? `${failed} operasi gagal. Klik untuk coba sinkron ulang.`
          : `${pending} operasi menunggu sinkronisasi. Klik untuk sinkron sekarang.`
      }
      aria-label={
        hasFailed
          ? `Sinkronisasi ulang ${failed} operasi gagal`
          : `Sinkronisasi ${pending} operasi tertunda`
      }
    >
      <span className="tabular-nums">{hasFailed ? `${failed} gagal` : `${pending} antre`}</span>
      <span aria-hidden="true" className="text-[10px]">
        {isSyncing ? '...' : 'Sync'}
      </span>
    </button>
  );
}
