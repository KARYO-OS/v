import { create } from 'zustand';
import { handleError } from '../lib/handleError';
import { fetchKomandanDashboardStats } from '../lib/api/dashboard';
import { requestCoalescer } from '../lib/requestCoalescer';
import { CacheWithTTL } from '../lib/cacheWithTTL';

interface KomandanDashboardStore {
  onlineCount: number;
  totalPersonel: number;
  isLoading: boolean;
  error: string | null;
  fetchStats: (satuan?: string) => Promise<void>;
}

export const useKomandanDashboardStore = create<KomandanDashboardStore>((set) => ({
  onlineCount: 0,
  totalPersonel: 0,
  isLoading: false,
  error: null,

  fetchStats: async (satuan) => {
    if (!satuan) {
      set({ onlineCount: 0, totalPersonel: 0, isLoading: false, error: null });
      return;
    }

    const cacheKey = `komandan_stats:${satuan}`;
    // Short-lived cache to reduce load during realtime bursts (5s)
    const cache = new CacheWithTTL<string, { onlineCount: number; totalPersonel: number }>(5000);

    set({ isLoading: true, error: null });
    try {
      // Use request coalescer so simultaneous calls reuse the same promise
      const stats = await requestCoalescer.coalesce(cacheKey, async () => {
        // Try cache first
        const cached = cache.get(cacheKey);
        if (cached) return cached;
        const result = await fetchKomandanDashboardStats(satuan);
        cache.set(cacheKey, result, 5000);
        return result;
      });

      set({
        onlineCount: stats.onlineCount,
        totalPersonel: stats.totalPersonel,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: handleError(err, 'Gagal memuat statistik personel'),
      });
    }
  },
}));
