import { supabase } from '../supabase';

export interface PlatformSettings {
  platform_name: string;
  platform_tagline: string;
  platform_logo_url: string | null;
}

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  const { data, error } = await supabase.rpc('get_platform_settings');
  if (error) throw error;
  return data as PlatformSettings | null;
}

export async function updatePlatformSettings(settings: {
  platformName: string;
  platformTagline: string;
  platformLogoUrl: string | null;
}): Promise<PlatformSettings> {
  const { data, error } = await supabase.rpc('update_platform_settings', {
    p_platform_name: settings.platformName,
    p_platform_logo_url: settings.platformLogoUrl,
    p_platform_tagline: settings.platformTagline,
  });
  if (error) throw error;
  return data as PlatformSettings;
}
