import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars via import.meta.env.VITE_* (not process.env.NEXT_PUBLIC_*)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-buildx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-buildx';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL !== undefined &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://demo-buildx.supabase.co'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
