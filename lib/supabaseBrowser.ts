import { env } from './env';
// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// HMR-safe singleton in dev to avoid multiple GoTrueClient instances
const getClient = () =>
  createClient(url, anon, {
    auth: {
      // Persist the auth session so that verification links
      // and page reloads keep the user logged in.
      persistSession: true,
      autoRefreshToken: true,
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
