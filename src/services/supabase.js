import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.supabase.co');
  } catch {
    return false;
  }
};

const hasValidCredentials = isValidSupabaseUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey.length > 20;

const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

if (!hasValidCredentials && !isDevMode) {
  console.error('[CRITICAL] Supabase credentials missing in production! Data will not load.');
} else if (!hasValidCredentials) {
  console.warn('Supabase credentials not found. Using local storage fallback (dev mode).');
}

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return supabase !== null;
};
