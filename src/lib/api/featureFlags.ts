import { supabase } from '../supabase';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlagsState, type FeatureKey } from '../featureFlags';

interface DbFeatureFlagRow {
  feature_key: FeatureKey;
  is_enabled: boolean;
}

export async function getFeatureFlags(callerId: string, callerRole: string): Promise<FeatureFlagsState> {
  const { data, error } = await supabase.rpc('get_feature_flags', {
    p_user_id: callerId,
    p_role: callerRole,
  });
  if (error) throw error;

  const rows = (data as DbFeatureFlagRow[] | null) ?? [];
  const next: FeatureFlagsState = { ...DEFAULT_FEATURE_FLAGS };

  for (const row of rows) {
    if (row.feature_key in next) {
      next[row.feature_key] = row.is_enabled;
    }
  }

  return next;
}

export async function updateFeatureFlag(
  callerId: string,
  callerRole: string,
  featureKey: FeatureKey,
  isEnabled: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('update_feature_flag', {
    p_user_id: callerId,
    p_role: callerRole,
    p_feature_key: featureKey,
    p_is_enabled: isEnabled,
  });

  if (error) throw error;
}