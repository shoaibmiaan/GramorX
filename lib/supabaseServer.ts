// lib/supabaseServer.ts
// Pages Router server-side Supabase helpers (typed).
// - supabaseServer(): use in API routes / getServerSideProps (anon key + request cookies)
// - supabaseService(): use ONLY on the server for admin tasks (service role key)

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

type DB = Database;
type Client = SupabaseClient<DB>;

// Env (validated in lib/env.ts)
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Prefer SUPABASE_SERVICE_KEY, fall back to SUPABASE_SERVICE_ROLE_KEY for older setups
const SERVICE_KEY = (env as any).SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Create a server-side Supabase client that forwards incoming cookies.
 * Use this in API routes and getServerSideProps for user-scoped calls.
 */
export function supabaseServer(req?: NextApiRequest, cookieHeader?: string): Client {
  const headers: Record<string, string> = { 'X-Client-Info': 'gramorx/pages-router' };

  // Forward the session cookie so auth.getSession() works on the server.
  const cookie = cookieHeader ?? req?.headers?.cookie;
  if (cookie) headers['Cookie'] = String(cookie);

  const client = createClient<DB>(URL, ANON_KEY, {
    auth: {
      persistSession: false,        // never persist on server
      autoRefreshToken: false,
    },
    global: {
      headers,
      fetch: (...args) => fetch(...args),
    },
  });

  return client;
}

/**
 * Create a Supabase client with the Service Role key.
 * ⚠️ Server-only. Never import this in client components.
 */
export function supabaseService(): Client {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseService() can only be used on the server.');
  }
  if (!SERVICE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  }

  const client = createClient<DB>(URL, SERVICE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'X-Client-Info': 'gramorx/pages-router-service' },
      fetch: (...args) => fetch(...args),
    },
  });

  return client;
}

/**
 * Convenience: fetch the current auth user on the server.
 */
export async function getServerUser(req?: NextApiRequest) {
  const sb = supabaseServer(req);
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}
