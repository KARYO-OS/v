import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, MapPin, UsersRound } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/common/Badge';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { createSatuan, deleteSatuan, fetchSatuans, updateSatuan } from '../../lib/api/satuans';
import type { Satuan } from '../../types';

const EMPTY_FORM = {
  nama: '',
  kode_satuan: '',
  tingkat: '' as Satuan['tingkat'] | '',
  logo_url: '',
  is_active: true,
};

export default function SatuanManagement() {
  const { showNotification } = useUIStore();
  const { user } = useAuthStore();

  const [satuans, setSatuans] = useState<Satuan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Satuan | null>(null);
  const [selected, setSelected] = useState<Satuan | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadSatuans = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSatuans(true);
      setSatuans(data);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Gagal memuat data satuan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSatuans();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return satuans;
    return satuans.filter((item) => {
      return [item.nama, item.kode_satuan, item.tingkat ?? '', item.logo_url ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [search, satuans]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (satuan: Satuan) => {
    setEditing(satuan);
    setForm({
      nama: satuan.nama,
      kode_satuan: satuan.kode_satuan,
      tingkat: satuan.tingkat ?? '',
      logo_url: satuan.logo_url ?? '',
      is_active: satuan.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim()) {
      showNotification('Nama satuan wajib diisi', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateSatuan(editing.id, {
          nama: form.nama,
          kode_satuan: form.kode_satuan,
          tingkat: form.tingkat || null,
          logo_url: form.logo_url || null,
          is_active: form.is_active,
          created_by: user?.id ?? null,
        });
        showNotification('Satuan berhasil diperbarui', 'success');
      } else {
        await createSatuan({
          nama: form.nama,
          kode_satuan: form.kode_satuan,
          tingkat: form.tingkat || null,
          logo_url: form.logo_url || null,
          is_active: form.is_active,
          created_by: user?.id ?? null,
        });
        showNotification('Satuan berhasil ditambahkan', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      await loadSatuans();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Gagal menyimpan satuan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (satuan: Satuan) => {
    setSelected(satuan);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await deleteSatuan(selected.id);
      showNotification('Satuan berhasil dihapus', 'success');
      setShowDelete(false);
      setSelected(null);
      await loadSatuans();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Gagal menghapus satuan', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout title="Manajemen Satuan">
      <div className="space-y-5">
        <PageHeader
          title="Manajemen Satuan"
          subtitle="Kelola master unit untuk mendukung multi-satuan tanpa memutus data legacy."
          meta={
            <>
              <span>Total {satuans.length} satuan</span>
              <span>{satuans.filter((item) => item.is_active).length} aktif</span>
            </>
          }
          actions={
            <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Tambah Satuan
            </Button>
          }
        />

        <div className="app-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Input
            type="text"
            placeholder="Cari nama, kode, atau tingkat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="flex-1"
          />
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1 rounded-full border border-surface/60 bg-surface/20 px-2.5 py-1">
              <UsersRound className="h-3.5 w-3.5" />
              Master tenant
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-surface/60 bg-surface/20 px-2.5 py-1">
              <Shield className="h-3.5 w-3.5" />
              RLS enabled
            </span>
          </div>
        </div>

        <Table<Satuan>
          columns={[
            {
              key: 'nama',
              header: 'Nama Satuan',
              render: (item) => (
                <div className="space-y-1">
                  <div className="font-semibold text-text-primary">{item.nama}</div>
                  <div className="text-xs text-text-muted">{item.kode_satuan}</div>
                </div>
              ),
            },
            {
              key: 'tingkat',
              header: 'Tingkat',
              render: (item) => item.tingkat ? <Badge variant="info">{item.tingkat}</Badge> : '—',
            },
            {
              key: 'logo_url',
              header: 'Logo',
              render: (item) => item.logo_url ? <a href={item.logo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Lihat</a> : '—',
            },
            {
              key: 'status',
              header: 'Status',
              render: (item) => item.is_active ? <Badge variant="success">Aktif</Badge> : <Badge variant="neutral">Nonaktif</Badge>,
            },
            {
              key: 'created_at',
              header: 'Dibuat',
              render: (item) => new Date(item.created_at).toLocaleDateString('id-ID'),
            },
            {
              key: 'actions',
              header: 'Aksi',
              render: (item) => (
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" leftIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => askDelete(item)}>
                    Hapus
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="Belum ada data satuan"
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Satuan' : 'Tambah Satuan'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            <Button onClick={handleSave} isLoading={saving}>{editing ? 'Simpan Perubahan' : 'Tambah'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nama Satuan *"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            leftIcon={<MapPin className="h-4 w-4" />}
          />
          <Input
            label="Kode Satuan"
            value={form.kode_satuan}
            onChange={(e) => setForm({ ...form, kode_satuan: e.target.value })}
            helpText="Akan digenerate otomatis dari nama jika dikosongkan"
          />
          <Input
            label="Tingkat"
            value={form.tingkat}
            onChange={(e) => setForm({ ...form, tingkat: e.target.value as Satuan['tingkat'] | '' })}
            placeholder="battalion / company / squad / detachment"
          />
          <Input
            label="URL Logo"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://..."
          />
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-surface accent-primary"
            />
            Satuan aktif
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Hapus Satuan"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDelete(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Hapus</Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Yakin ingin menghapus satuan <span className="font-semibold text-text-primary">{selected?.nama}</span>? Pastikan tidak ada data aktif yang masih menggunakan satuan ini.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
