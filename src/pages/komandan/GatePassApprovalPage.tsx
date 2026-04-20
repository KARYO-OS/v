import { useEffect, useState } from 'react';
import { ClipboardCheck, Check, X } from 'lucide-react';
import { useGatePassStore } from '../../store/gatePassStore';
import { useGatePassRealtime } from '../../hooks/useGatePassRealtime';
import GatePassStatusBadge from '../../components/gatepass/GatePassStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/common/Button';
import { useUIStore } from '../../store/uiStore';
import type { GatePass } from '../../types';

function formatDateTime(value?: string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
}

export default function GatePassApprovalPage() {
  const gatePasses = useGatePassStore(s => s.gatePasses);
  const fetchGatePasses = useGatePassStore(s => s.fetchGatePasses);
  const approveGatePass = useGatePassStore(s => s.approveGatePass);
  const { showNotification } = useUIStore();
  const [actioningId, setActioningId] = useState<string | null>(null);
  useGatePassRealtime();

  useEffect(() => { void fetchGatePasses(); }, [fetchGatePasses]);

  const pendingPasses = gatePasses.filter(gp => gp.status === 'pending');
  const activeGatePasses = gatePasses.filter(
    gp => gp.status === 'approved' || gp.status === 'checked_in' || gp.status === 'completed' || gp.status === 'overdue',
  );

  const checkInCount = gatePasses.filter(gp => gp.status === 'checked_in').length;
  const overdueCount = gatePasses.filter(gp => gp.status === 'overdue').length;

  async function handleAction(gp: GatePass, approved: boolean) {
    setActioningId(gp.id);
    try {
      await approveGatePass(gp.id, approved);
      showNotification(
        approved ? `Gate Pass ${gp.user?.nama ?? ''} disetujui` : `Gate Pass ${gp.user?.nama ?? ''} ditolak`,
        approved ? 'success' : 'warning',
      );
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Gagal memproses', 'error');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <DashboardLayout title="Approval Gate Pass">
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Approval Gate Pass"
          subtitle="Tinjau dan setujui atau tolak pengajuan izin keluar personel."
          breadcrumbs={[
            { label: 'Pusat Operasi', href: '/komandan/dashboard' },
            { label: 'Approval Gate Pass' },
          ]}
          meta={
            <>
              {pendingPasses.length > 0 && (
                <span className="text-accent-gold font-medium">{pendingPasses.length} menunggu persetujuan</span>
              )}
              {checkInCount > 0 && <span>{checkInCount} personel di luar</span>}
              {overdueCount > 0 && <span className="text-accent-red font-medium">{overdueCount} terlambat kembali</span>}
            </>
          }
        />

        {/* Pending Approvals */}
        {pendingPasses.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-gold">
              Menunggu Persetujuan ({pendingPasses.length})
            </h2>
            <div className="app-card divide-y divide-surface/50 overflow-hidden">
              {pendingPasses.map(gp => (
                <div key={gp.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {gp.user && (
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {gp.user.nama}
                        <span className="text-text-muted font-normal ml-1">({gp.user.nrp})</span>
                      </p>
                    )}
                    <p className="font-medium text-text-primary truncate">{gp.tujuan}</p>
                    <p className="text-xs text-text-muted truncate">{gp.keperluan}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {formatDateTime(gp.waktu_keluar)} — {formatDateTime(gp.waktu_kembali)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => void handleAction(gp, true)}
                      isLoading={actioningId === gp.id}
                      leftIcon={<Check className="h-3.5 w-3.5" />}
                    >
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => void handleAction(gp, false)}
                      isLoading={actioningId === gp.id}
                      leftIcon={<X className="h-3.5 w-3.5" />}
                    >
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active / Operational status */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Status Operasional
          </h2>
          <div className="app-card overflow-hidden">
            {activeGatePasses.length === 0 ? (
              <EmptyState
                icon={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
                title="Belum ada data Gate Pass operasional"
                description="Gate Pass yang disetujui dan sedang aktif akan muncul di sini."
                className="border-0 bg-transparent py-12"
              />
            ) : (
              <div className="divide-y divide-surface/50">
                {activeGatePasses.map(gp => (
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
                        {formatDateTime(gp.waktu_keluar)} — {formatDateTime(gp.waktu_kembali)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <GatePassStatusBadge gatePass={gp} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
