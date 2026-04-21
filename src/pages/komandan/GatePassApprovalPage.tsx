import { useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useGatePassStore } from '../../store/gatePassStore';
import { useGatePassRealtime } from '../../hooks/useGatePassRealtime';
import { useUIStore } from '../../store/uiStore';
import GatePassStatusBadge from '../../components/gatepass/GatePassStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/common/Button';

export default function GatePassApprovalPage() {
  const gatePasses = useGatePassStore(s => s.gatePasses);
  const fetchGatePasses = useGatePassStore(s => s.fetchGatePasses);
  const approveGatePass = useGatePassStore(s => s.approveGatePass);
  const { showNotification } = useUIStore();
  useGatePassRealtime();

  useEffect(() => { void fetchGatePasses(); }, [fetchGatePasses]);

  const visibleGatePasses = gatePasses.filter(
    gp => gp.status === 'pending' || gp.status === 'approved' || gp.status === 'checked_in' || gp.status === 'completed' || gp.status === 'overdue',
  );

  const pendingCount = gatePasses.filter(gp => gp.status === 'pending').length;
  const checkInCount = gatePasses.filter(gp => gp.status === 'checked_in').length;
  const overdueCount = gatePasses.filter(gp => gp.status === 'overdue').length;

  const handleDecision = async (id: string, approved: boolean) => {
    try {
      await approveGatePass(id, approved);
      showNotification(approved ? 'Gate Pass disetujui' : 'Gate Pass ditolak', approved ? 'success' : 'info');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses persetujuan Gate Pass';
      showNotification(message, 'error');
    }
  };

  return (
    <DashboardLayout title="Status Gate Pass">
      <div className="mx-auto max-w-2xl space-y-5">
        <PageHeader
          title="Persetujuan & Status Gate Pass"
          subtitle="Tinjau pengajuan personel, lalu monitor proses scan keluar/kembali melalui QR Pos Jaga."
          breadcrumbs={[
            { label: 'Pusat Operasi', href: '/komandan/dashboard' },
            { label: 'Persetujuan Gate Pass' },
          ]}
          meta={
            <>
              {pendingCount > 0 && <span>{pendingCount} menunggu persetujuan</span>}
              {checkInCount > 0 && <span>{checkInCount} personel di luar</span>}
              {overdueCount > 0 && <span className="text-accent-red font-medium">{overdueCount} terlambat kembali</span>}
            </>
          }
        />

        <div className="app-card overflow-hidden">
          {visibleGatePasses.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
              title="Belum ada pengajuan atau aktivitas Gate Pass"
              description="Pengajuan pending, disetujui, atau yang sedang diproses scan akan muncul di sini."
              className="border-0 bg-transparent py-12"
            />
          ) : (
            <div className="divide-y divide-surface/50">
              {visibleGatePasses.map(gp => (
                <div key={gp.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    {gp.user && (
                      <p className="text-sm font-semibold text-primary truncate">
                        {gp.user.nama}
                        <span className="text-text-muted font-normal ml-1">({gp.user.nrp})</span>
                      </p>
                    )}
                    <p className="font-medium text-text-primary truncate">{gp.tujuan}</p>
                    <p className="text-xs text-text-muted truncate">{gp.keperluan}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {gp.waktu_keluar} — {gp.waktu_kembali}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {gp.status === 'pending' && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => { void handleDecision(gp.id, true); }}>
                          Setujui
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { void handleDecision(gp.id, false); }}>
                          Tolak
                        </Button>
                      </>
                    )}
                    <GatePassStatusBadge gatePass={gp} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
