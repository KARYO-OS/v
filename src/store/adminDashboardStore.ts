import { create } from 'zustand';
import { handleError } from '../lib/handleError';
import {
  fetchAdminDashboardSnapshot,
  refreshAdminDashboardSnapshot,
  type AdminDashboardSnapshot,
} from '../lib/api/dashboard';

interface AdminDashboardStore {
  snapshot: AdminDashboardSnapshot | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchDashboard: () => Promise<boolean>;
  refreshDashboard: () => Promise<boolean>;
  // Getters for quick access to common stats
  getStats: () => AdminDashboardSnapshot['stats'] | null;
  getGatePassStats: () => AdminDashboardSnapshot['gatePassStats'] | null;
}

export const useAdminDashboardStore = create<AdminDashboardStore>((set, get) => ({
  snapshot: null,
  isLoading: true,
  isRefreshing: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await fetchAdminDashboardSnapshot();
      // Batch update: set all state at once
      set({ snapshot, isLoading: false, isRefreshing: false, error: null });
      return true;
    } catch (err) {
      // Batch error state
      set({
        isLoading: false,
        isRefreshing: false,
        error: handleError(err, 'Gagal memuat dashboard'),
      });
      return false;
    }
  },

  refreshDashboard: async () => {
    set({ isRefreshing: true, error: null });
    try {
      // Use refresh function to bypass cache
      const snapshot = await refreshAdminDashboardSnapshot();
      // Batch update
      set({ snapshot, isLoading: false, isRefreshing: false, error: null });
      return true;
    } catch (err) {
      // Batch error state
      set({
        isLoading: false,
        isRefreshing: false,
        error: handleError(err, 'Gagal memuat dashboard'),
      });
      return false;
    }
  },

  // Getter for stats (memoized access)
  getStats: () => get().snapshot?.stats ?? null,

  // Getter for gate pass stats (memoized access)
  getGatePassStats: () => get().snapshot?.gatePassStats ?? null,
}));
