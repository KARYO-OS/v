import { supabase } from '../supabase';
import type { PosJaga, ScanPosJagaResult } from '../../types';

interface VerifyUserPinRow {
  user_id: string;
  user_role: string;
}

async function ensureSessionContext(callerId: string, callerRole: string): Promise<void> {
  const res = await supabase.rpc('set_session_context', {
    p_user_id: callerId,
    p_role: callerRole,
  });
  if (res?.error) throw res.error;
}

export async function fetchAllPosJaga(callerId: string, callerRole: string): Promise<PosJaga[]> {
  await ensureSessionContext(callerId, callerRole);
  const { data, error } = await supabase
    .from('pos_jaga')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as PosJaga[]) ?? [];
}

export async function insertPosJaga(callerId: string, callerRole: string, payload: { nama: string }): Promise<PosJaga> {
  await ensureSessionContext(callerId, callerRole);
  const { data, error } = await supabase
    .from('pos_jaga')
    .insert([payload])
    .select('*')
    .single();
  if (error) throw error;
  if (!data) throw new Error('Gagal membuat QR pos jaga');
  return data as PosJaga;
}

export async function patchPosJagaActive(callerId: string, callerRole: string, id: string, is_active: boolean): Promise<void> {
  await ensureSessionContext(callerId, callerRole);
  const { error } = await supabase
    .from('pos_jaga')
    .update({ is_active })
    .eq('id', id);
  if (error) throw error;
}

export async function rpcScanPosJaga(posToken: string, userId: string): Promise<ScanPosJagaResult> {
  const { data, error } = await supabase.rpc('scan_pos_jaga', {
    p_pos_token: posToken,
    p_user_id: userId,
  });
  if (error || !data) throw new Error(error?.message ?? 'QR pos jaga tidak valid');
  return data as ScanPosJagaResult;
}

export async function rpcScanPosJagaWithCredentials(
  posToken: string,
  nrp: string,
  pin: string,
): Promise<ScanPosJagaResult> {
  const normalizedNrp = nrp.trim();
  const normalizedPin = pin.trim();
  if (!normalizedNrp || !normalizedPin) {
    throw new Error('NRP dan PIN wajib diisi');
  }

  const { data: authData, error: authError } = await supabase
    .rpc('verify_user_pin', {
      p_nrp: normalizedNrp,
      p_pin: normalizedPin,
    });

  if (authError) throw authError;
  const row = Array.isArray(authData)
    ? (authData[0] as VerifyUserPinRow | undefined) ?? null
    : (authData as VerifyUserPinRow | null);
  if (!row) throw new Error('NRP atau PIN salah');

  if (row.user_role !== 'prajurit') {
    throw new Error('Hanya prajurit yang dapat melakukan scan pos jaga');
  }

  return rpcScanPosJaga(posToken, row.user_id);
}
