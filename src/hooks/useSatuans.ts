import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Satuan } from '../types';

interface UseSatuansOptions {
  onlyActive?: boolean;
}

export function useSatuans(options: UseSatuansOptions = {}) {
  const { onlyActive = true } = options;
  const [satuans, setSatuans] = useState<Satuan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSatuans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('satuans')
        .select('id, nama, kode_satuan, tingkat, logo_url, is_active, created_by, created_at, updated_at')
        .order('nama', { ascending: true });

      if (onlyActive) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setSatuans((data ?? []) as Satuan[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data satuan';
      setError(message);
      setSatuans([]);
    } finally {
      setIsLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    void fetchSatuans();
  }, [fetchSatuans]);

  return {
    satuans,
    isLoading,
    error,
    fetchSatuans,
  };
}
