// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// HMR-safe singleton in dev to avoid multiple GoTrueClient instances
const getClient = () =>
  createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // keep default storageKey (sb-<project>-auth-token)
    },
  });

export const supabaseBrowser =
  (typeof window !== 'undefined'
    ? ((window as any).__supa ?? ((window as any).__supa = getClient()))
    : getClient());

// OPTIONAL: expose for console debugging in dev
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as any).supa = supabaseBrowser;
}
