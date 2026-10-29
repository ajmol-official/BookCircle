import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials for BookCircle
const DEFAULT_SUPABASE_URL = 'https://kumcyuhvjnzppxjoetnz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_oAX-TA1CtFkCqspxmtFF3w_jkwJD4pK';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Supabase client instance (or dummy client if not configured yet to prevent crash)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });

