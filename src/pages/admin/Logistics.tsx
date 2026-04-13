import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table from '../../components/ui/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import PageHeader from '../../components/ui/PageHeader';
import { useUIStore } from '../../store/uiStore';
import { supabase } from '../../lib/supabase';
import type { LogisticsItem } from '../../types';

export default function Logistics() {
  const { showNotification } = useUIStore();
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Partial<LogisticsItem>>({ nama_item: '', jumlah: 0, kondisi: 'baik' });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase.from('logistics_items').select('*').order('nama_item');
    setItems((data as LogisticsItem[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const filtered = items.filter(
    (i) => !search || i.nama_item.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!form.nama_item) { showNotification('Nama item wajib diisi', 'error'); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('logistics_items').insert(form);
      if (error) throw error;
      showNotification('Item berhasil ditambahkan', 'success');
      setShowCreate(false);
      setForm({ nama_item: '', jumlah: 0, kondisi: 'baik' });
      await fetchItems();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Gagal menyimpan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const kondisiColors = {
    baik: 'text-success',
    rusak_ringan: 'text-accent-gold',
    rusak_berat: 'text-accent-red',
  };

  return (
    <DashboardLayout title="Manajemen Logistik">
      <div className="space-y-5">
        <PageHeader
          title="Manajemen Logistik"
          subtitle="Inventaris dan kondisi perlengkapan operasional dipantau secara berkala."
          meta={<span>Total item: {filtered.length}</span>}
          actions={<Button onClick={() => setShowCreate(true)}>+ Tambah Item</Button>}
        />

        <div className="app-card flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
          <input
            type="text"
            placeholder="Cari item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control flex-1"
          />
        </div>

        <Table<LogisticsItem>
          columns={[
            { key: 'nama_item', header: 'Nama Item' },
            { key: 'kategori', header: 'Kategori', render: (i) => i.kategori ?? '—' },
            { key: 'jumlah', header: 'Jumlah', render: (i) => `${i.jumlah} ${i.satuan_item ?? ''}` },
            {
              key: 'kondisi',
              header: 'Kondisi',
              render: (i) => i.kondisi ? (
                <span className={`font-medium capitalize ${kondisiColors[i.kondisi]}`}>
                  {i.kondisi.replace('_', ' ')}
                </span>
              ) : '—',
            },
            { key: 'lokasi', header: 'Lokasi', render: (i) => i.lokasi ?? '—' },
          ]}
          data={filtered}
          keyExtractor={(i) => i.id}
          isLoading={isLoading}
          emptyMessage="Tidak ada item logistik"
        />
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tambah Item Logistik"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Batal</Button>
            <Button onClick={handleCreate} isLoading={isSaving}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nama Item *" type="text" value={form.nama_item ?? ''} onChange={(e) => setForm({ ...form, nama_item: e.target.value })} required />
          <Input label="Kategori" type="text" value={form.kategori ?? ''} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Jumlah" type="number" min="0" value={String(form.jumlah ?? 0)} onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })} />
            <Input label="Satuan" type="text" placeholder="pcs, unit, kg..." value={form.satuan_item ?? ''} onChange={(e) => setForm({ ...form, satuan_item: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-text-primary">Kondisi</label>
            <select className="form-control mt-1" value={form.kondisi ?? 'baik'} onChange={(e) => setForm({ ...form, kondisi: e.target.value as LogisticsItem['kondisi'] })}>
              <option value="baik">Baik</option>
              <option value="rusak_ringan">Rusak Ringan</option>
              <option value="rusak_berat">Rusak Berat</option>
            </select>
          </div>
          <Input label="Lokasi" type="text" value={form.lokasi ?? ''} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
          <Input label="Catatan" type="text" value={form.catatan ?? ''} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
