import { supabase } from '../supabase';

/**
 * Bind current caller identity into DB session context for SECURITY DEFINER RPC.
 * This is a safe no-op when backend already reads identity from custom headers.
 */
export async function ensureSessionContext(callerId: string, callerRole: string): Promise<void> {
  const { error } = await supabase.rpc('set_session_context', {
    p_user_id: callerId,
    p_role: callerRole,
  });

  if (error) throw error;
}
