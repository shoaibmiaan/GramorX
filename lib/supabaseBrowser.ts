import { env } from "@/lib/env";
// lib/supabaseBrowser.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url  = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-side client (persists session)
export const supabaseBrowser = createClient<Database>(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Helper: attach the current user's bearer token to fetch headers
export async function authHeaders(init: Record<string, string> = {}) {
  const { data: { session } } = await supabaseBrowser.auth.getSession();
  return session?.access_token
    ? { ...init, Authorization: `Bearer ${session.access_token}` }
    : init;
}

// (optional) non-persistent client
export const supabase = createClient<Database>(url, anon, {
  auth: { persistSession: false },
});
