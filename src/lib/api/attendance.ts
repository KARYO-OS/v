import { supabase } from '../supabase';
import type { Attendance } from '../../types';

export async function fetchAttendance(callerId: string, callerRole: string, userId: string, limit = 30): Promise<Attendance[]> {
  const { data, error } = await supabase.rpc('api_get_attendance', {
    p_user_id: callerId,
    p_role: callerRole,
    p_target_user_id: userId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data as Attendance[]) ?? [];
}

export async function rpcCheckIn(userId: string): Promise<void> {
  const { error } = await supabase.rpc('server_checkin', { p_user_id: userId });
  if (error) throw new Error(error.message);
}

export async function rpcCheckOut(userId: string): Promise<void> {
  const { error } = await supabase.rpc('server_checkout', { p_user_id: userId });
  if (error) throw new Error(error.message);
}
