import { supabase } from '../supabase';
import type { Satuan } from '../../types';

function slugify(text: string): string {
  const normalized = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'satuan';
}

export interface SatuanPayload {
  nama: string;
  kode_satuan?: string;
  tingkat?: Satuan['tingkat'] | null;
  logo_url?: string | null;
  is_active?: boolean;
  created_by?: string | null;
}

export async function fetchSatuans(includeInactive = true): Promise<Satuan[]> {
  let query = supabase
    .from('satuans')
    .select('id, nama, kode_satuan, tingkat, logo_url, is_active, created_by, created_at, updated_at')
    .order('nama', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Satuan[];
}

export async function createSatuan(payload: SatuanPayload): Promise<Satuan> {
  const kode = payload.kode_satuan?.trim() || slugify(payload.nama);
  const { data, error } = await supabase
    .from('satuans')
    .insert({
      nama: payload.nama.trim(),
      kode_satuan: kode,
      tingkat: payload.tingkat ?? null,
      logo_url: payload.logo_url ?? null,
      is_active: payload.is_active ?? true,
      created_by: payload.created_by ?? null,
    })
    .select('id, nama, kode_satuan, tingkat, logo_url, is_active, created_by, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Satuan;
}

export async function updateSatuan(id: string, payload: Partial<SatuanPayload>): Promise<Satuan> {
  const updates: Record<string, unknown> = {};

  if (payload.nama !== undefined) updates.nama = payload.nama.trim();
  if (payload.kode_satuan !== undefined) updates.kode_satuan = payload.kode_satuan.trim() || slugify(payload.nama ?? 'satuan');
  if (payload.tingkat !== undefined) updates.tingkat = payload.tingkat;
  if (payload.logo_url !== undefined) updates.logo_url = payload.logo_url;
  if (payload.is_active !== undefined) updates.is_active = payload.is_active;
  if (payload.created_by !== undefined) updates.created_by = payload.created_by;

  const { data, error } = await supabase
    .from('satuans')
    .update(updates)
    .eq('id', id)
    .select('id, nama, kode_satuan, tingkat, logo_url, is_active, created_by, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Satuan;
}

export async function deleteSatuan(id: string): Promise<void> {
  const { error } = await supabase.from('satuans').delete().eq('id', id);
  if (error) throw error;
}
