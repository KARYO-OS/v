import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn at runtime rather than throwing at module evaluation time.
  // A module-level throw happens before React mounts, meaning the
  // ErrorBoundary never renders and the user sees a blank page.
  console.error(
    '[KARYO OS] Missing Supabase environment variables. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Netlify ' +
      'environment variables (Site Settings → Environment Variables).',
  );
}

// createClient requires non-empty strings; use safe placeholders so the
// module loads and the app can render an error UI instead of crashing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
