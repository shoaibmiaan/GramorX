// lib/supabaseBrowser.ts
// Use @supabase/auth-helpers-nextjs so that auth tokens are also
// synchronised to cookies (sb-access-token / sb-refresh-token).
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// HMR-safe singleton in dev to avoid multiple GoTrueClient instances
const getClient = () => createClientComponentClient();

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
