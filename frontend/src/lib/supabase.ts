import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env.VITE_* (not process.env.NEXT_PUBLIC_*)
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  if (url.includes('YOUR_SUPABASE')) return false;
  return true;
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : 'https://demo-buildx.supabase.co';
const supabaseAnonKey =
  rawKey && !rawKey.includes('YOUR_SUPABASE')
    ? rawKey
    : 'demo-anon-key-buildx';

export const isSupabaseConfigured = () => {
  return (
    isValidUrl(import.meta.env.VITE_SUPABASE_URL) &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('YOUR_SUPABASE') &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://demo-buildx.supabase.co'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
