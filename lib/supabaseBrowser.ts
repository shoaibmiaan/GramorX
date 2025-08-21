// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from '@/env';

const url  = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isBrowser = typeof window !== 'undefined';

// Browser-side client (persists session)
export const supabaseBrowser = isBrowser
  ? createClient<Database>(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : undefined as unknown as ReturnType<typeof createClient<Database>>;

// Helper: attach the current user's bearer token to fetch headers
export async function authHeaders(init: Record<string, string> = {}) {
  if (!isBrowser) return init;
  const { data: { session } } = await supabaseBrowser!.auth.getSession();
  return session?.access_token
    ? { ...init, Authorization: `Bearer ${session.access_token}` }
    : init;
}

// (optional) non-persistent client
export const supabase = isBrowser
  ? createClient<Database>(url, anon, {
      auth: { persistSession: false },
    })
  : undefined as unknown as ReturnType<typeof createClient<Database>>;
