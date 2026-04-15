import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const PLATFORM_SETTINGS_CACHE_KEY = 'karyo_platform_settings';

export interface PlatformBranding {
  platformName: string;
  platformTagline: string;
  platformLogoUrl: string | null;
}

const DEFAULT_PLATFORM_BRANDING: PlatformBranding = {
  platformName: 'KARYO OS',
  platformTagline: 'Command and Battalion Tracking',
  platformLogoUrl: null,
};

interface PlatformStore {
  settings: PlatformBranding;
  isLoaded: boolean;
  isSaving: boolean;
  loadPlatformBranding: (force?: boolean) => Promise<void>;
  updatePlatformBranding: (settings: PlatformBranding) => Promise<void>;
}

const safeStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
};

const normalizeBranding = (raw: unknown): PlatformBranding => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const platformName = String(data.platform_name ?? data.platformName ?? '').trim() || DEFAULT_PLATFORM_BRANDING.platformName;
  const platformTagline = String(data.platform_tagline ?? data.platformTagline ?? '').trim() || DEFAULT_PLATFORM_BRANDING.platformTagline;
  const rawLogoUrl = String(data.platform_logo_url ?? data.platformLogoUrl ?? '').trim();

  return {
    platformName,
    platformTagline,
    platformLogoUrl: rawLogoUrl || null,
  };
};

const loadCachedBranding = (): PlatformBranding => {
  const raw = safeStorageGet(PLATFORM_SETTINGS_CACHE_KEY);
  if (!raw) return DEFAULT_PLATFORM_BRANDING;

  try {
    return normalizeBranding(JSON.parse(raw));
  } catch {
    return DEFAULT_PLATFORM_BRANDING;
  }
};

const applyDocumentBranding = (settings: PlatformBranding) => {
  if (typeof document === 'undefined') return;

  document.title = `${settings.platformName} | Sistem Operasional`;

  const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
  if (favicon && settings.platformLogoUrl) {
    favicon.href = settings.platformLogoUrl;
  }
};

const persistBranding = (settings: PlatformBranding) => {
  safeStorageSet(PLATFORM_SETTINGS_CACHE_KEY, JSON.stringify(settings));
  applyDocumentBranding(settings);
};

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  settings: loadCachedBranding(),
  isLoaded: false,
  isSaving: false,

  loadPlatformBranding: async (force = false) => {
    if (get().isLoaded && !force) return;

    const { data, error } = await supabase.rpc('get_platform_settings');
    if (error) {
      set({ isLoaded: true });
      return;
    }

    const normalized = normalizeBranding(data);
    persistBranding(normalized);
    set({ settings: normalized, isLoaded: true });
  },

  updatePlatformBranding: async (settings: PlatformBranding) => {
    const normalizedInput = normalizeBranding(settings);
    set({ isSaving: true });

    try {
      const { data, error } = await supabase.rpc('update_platform_settings', {
        p_platform_name: normalizedInput.platformName,
        p_platform_logo_url: normalizedInput.platformLogoUrl,
        p_platform_tagline: normalizedInput.platformTagline,
      });

      if (error) throw error;

      const normalized = normalizeBranding(data ?? normalizedInput);
      persistBranding(normalized);
      set({ settings: normalized, isSaving: false, isLoaded: true });
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },
}));

applyDocumentBranding(loadCachedBranding());
