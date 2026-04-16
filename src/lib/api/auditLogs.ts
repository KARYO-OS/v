import { supabase } from '../supabase';
import type { AuditLog } from '../../types';

export interface FetchAuditLogsParams {
  callerId: string;
  callerRole: string;
  userId?: string;
  action?: string;
  limit?: number;
}

export async function fetchAuditLogs(params: FetchAuditLogsParams): Promise<AuditLog[]> {
  const { data, error } = await supabase.rpc('api_get_audit_logs', {
    p_user_id: params.callerId,
    p_role: params.callerRole,
    p_filter_user_id: params.userId ?? null,
    p_action_filter: params.action ?? null,
    p_limit: params.limit ?? 100,
  });
  if (error) throw error;
  return (data as AuditLog[]) ?? [];
}
