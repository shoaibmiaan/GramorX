// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ CI/dev quiet flag (skip refresh/persist in CI)
const IS_CI = process.env.NEXT_PUBLIC_CI === 'true';

// HMR-safe singleton in dev to avoid multiple GoTrueClient instances
const getClient = () =>
  createClient(url, anon, {
    auth: {
      // Persist & refresh only if not in CI
      persistSession: !IS_CI,
      autoRefreshToken: !IS_CI,
      detectSessionInUrl: true,
      // keep default storageKey (sb-<project>-auth-token)
    },
  });

declare global {
  interface Window {
    __supa?: ReturnType<typeof getClient>;
    supa?: ReturnType<typeof getClient>;
  }
}

export const supabaseBrowser =
  typeof window !== 'undefined'
    ? window.__supa ?? (window.__supa = getClient())
    : getClient();

// Attach auth headers if session is present
export async function authHeaders(
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();
  const token = session?.access_token;
  return token ? { ...headers, Authorization: `Bearer ${token}` } : { ...headers };
}

// OPTIONAL: expose for console debugging in dev
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  window.supa = supabaseBrowser;
}
