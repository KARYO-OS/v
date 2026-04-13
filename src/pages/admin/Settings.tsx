import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function Settings() {
  const { user } = useAuthStore();
  const {
    isDarkMode,
    toggleDarkMode,
    notificationsEnabled,
    setNotificationsEnabled,
    displayDensity,
    setDisplayDensity,
    toggleDisplayDensity,
    dashboardAutoRefreshEnabled,
    setDashboardAutoRefreshEnabled,
    dashboardAutoRefreshMinutes,
    setDashboardAutoRefreshMinutes,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();

  const restoreRecommendedDefaults = () => {
    if (!isDarkMode) toggleDarkMode();
    setNotificationsEnabled(true);
    setDisplayDensity('comfortable');
    setDashboardAutoRefreshEnabled(true);
    setDashboardAutoRefreshMinutes(3);
    setSidebarOpen(true);
  };

  return (
    <DashboardLayout title="Pengaturan Sistem">
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title="Pengaturan Sistem"
          subtitle="Atur tampilan, notifikasi, dan perilaku dashboard agar lebih sesuai kebutuhan operasional."
          meta={
            <>
              <span>{isDarkMode ? 'Mode gelap aktif' : 'Mode terang aktif'}</span>
              <span>{dashboardAutoRefreshEnabled ? `Auto refresh ${dashboardAutoRefreshMinutes} menit` : 'Auto refresh nonaktif'}</span>
            </>
          }
          actions={<Button variant="outline" onClick={restoreRecommendedDefaults}>Kembalikan Rekomendasi</Button>}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="app-card p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-text-primary">Informasi Sistem</h2>
            <div className="space-y-3">
              {[
                { label: 'Versi Aplikasi', value: 'v1.0.0' },
                { label: 'Platform', value: 'KARYO OS — Command & Battalion Tracking' },
                { label: 'Satuan', value: user?.satuan ?? '—' },
                { label: 'Admin', value: user?.nama ?? '—' },
                { label: 'NRP Admin', value: user?.nrp ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-surface/75 py-2 last:border-0">
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className="text-sm font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="app-card p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">Tampilan</h2>
              <Button size="sm" variant="ghost" onClick={toggleDisplayDensity}>
                {displayDensity === 'compact' ? 'Mode Ringkas' : 'Mode Nyaman'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-surface/70 bg-surface/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Mode Gelap</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {isDarkMode ? 'Aktif — tampilan dengan latar gelap' : 'Nonaktif — tampilan dengan latar terang'}
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    isDarkMode ? 'bg-primary' : 'bg-surface'
                  }`}
                  aria-label="Toggle dark mode"
                  role="switch"
                  aria-checked={isDarkMode}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-surface/70 bg-surface/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Kepadatan Tampilan</p>
                  <p className="text-xs text-text-muted mt-0.5">Mengatur jarak antar elemen di dashboard dan panel data.</p>
                </div>
                <div className="flex rounded-xl border border-surface/70 bg-bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setDisplayDensity('comfortable')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      displayDensity === 'comfortable' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Nyaman
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayDensity('compact')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      displayDensity === 'compact' ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Ringkas
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-surface/70 bg-surface/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Sidebar Desktop</p>
                  <p className="text-xs text-text-muted mt-0.5">Menjaga sidebar tetap terbuka saat sesi berikutnya.</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    sidebarOpen ? 'bg-primary' : 'bg-surface'
                  }`}
                  aria-label="Toggle sidebar preference"
                  role="switch"
                  aria-checked={sidebarOpen}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      sidebarOpen ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="app-card p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-text-primary">Notifikasi & Sinkronisasi</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-surface/70 bg-surface/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Notifikasi Browser</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {notificationsEnabled ? 'Pesan, tugas, dan update realtime akan muncul sebagai notifikasi' : 'Notifikasi browser dinonaktifkan'}
                  </p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    notificationsEnabled ? 'bg-primary' : 'bg-surface'
                  }`}
                  aria-label="Toggle notifications"
                  role="switch"
                  aria-checked={notificationsEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-surface/70 bg-surface/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Auto Refresh Dashboard</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {dashboardAutoRefreshEnabled ? 'Dashboard akan memperbarui data secara berkala' : 'Refresh otomatis dimatikan'}
                  </p>
                </div>
                <button
                  onClick={() => setDashboardAutoRefreshEnabled(!dashboardAutoRefreshEnabled)}
                  className={`relative h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    dashboardAutoRefreshEnabled ? 'bg-primary' : 'bg-surface'
                  }`}
                  aria-label="Toggle auto refresh"
                  role="switch"
                  aria-checked={dashboardAutoRefreshEnabled}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      dashboardAutoRefreshEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="text-sm font-semibold text-text-primary">Interval Refresh</label>
                  <select
                    className="form-control mt-1"
                    value={dashboardAutoRefreshMinutes}
                    onChange={(e) => setDashboardAutoRefreshMinutes(Number(e.target.value))}
                    disabled={!dashboardAutoRefreshEnabled}
                  >
                    <option value={1}>1 menit</option>
                    <option value={3}>3 menit</option>
                    <option value={5}>5 menit</option>
                    <option value={10}>10 menit</option>
                  </select>
                </div>
                <div className="rounded-xl border border-surface/70 bg-bg-card px-4 py-3 text-xs text-text-muted">
                  Interval ini memengaruhi dashboard admin yang menggunakan data realtime.
                </div>
              </div>
            </div>
          </div>

          <div className="app-card p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-text-primary">Keamanan Session</h2>
            <div className="space-y-3">
              {[
                { label: 'Durasi Session', value: '8 jam (1 shift)' },
                { label: 'Max Percobaan Login', value: '5 kali' },
                { label: 'Lockout Duration', value: '15 menit' },
                { label: 'PIN Hashing', value: 'bcrypt (Supabase pgcrypto)' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-surface/75 py-2 last:border-0">
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className="text-sm font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-accent-gold/35 bg-accent-gold/10 p-4">
          <p className="text-sm text-accent-gold">
            ⚠ Pengaturan lanjutan (konfigurasi Supabase, RLS policy, dll.) dikelola langsung melalui Supabase Dashboard.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
