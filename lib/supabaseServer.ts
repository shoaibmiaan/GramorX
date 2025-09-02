// lib/supabaseServer.ts
// Server-side Supabase helpers for Pages Router.
// - createSupabaseServerClient(opts): general factory (named + default export)
// - supabaseServer(req?, cookie?): anon-key client that forwards cookies
// - supabaseService(): service-role client (server-only)
// - getServerUser(req?): convenience to read the current user on the server

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { env } from '@/lib/env';
// If you have generated types, you can swap `any` with your Database type.
// import type { Database } from '@/types/supabase';
// type DB = Database;
type DB = any;

// ---- Env (validated in lib/env.ts) ----
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Prefer SUPABASE_SERVICE_KEY, fall back to SUPABASE_SERVICE_ROLE_KEY for older setups
const SERVICE_KEY = (env as any).SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

// ---------- 1) Generic factory (named) ----------
type Options = {
  req?: NextApiRequest;
  serviceRole?: boolean;
  headers?: Record<string, string>;
};

export function createSupabaseServerClient<T = any>(
  opts: Options = {}
): SupabaseClient<T> {
  if (!URL || !(ANON_KEY || SERVICE_KEY)) {
    throw new Error('Supabase env vars are missing');
  }

  const key = opts.serviceRole ? SERVICE_KEY : ANON_KEY;
  const headers: Record<string, string> = {
    'X-Client-Info': 'gramorx/pages-router',
    ...(opts.headers || {}),
  };

  // Forward auth bearer + cookies when available
  const authHeader = opts.req?.headers?.authorization;
  if (authHeader && !headers['Authorization']) headers['Authorization'] = String(authHeader);

  const cookieHeader = opts.req?.headers?.cookie;
  if (cookieHeader && !headers['Cookie']) headers['Cookie'] = String(cookieHeader);

  return createClient<T>(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers,
      fetch: (...args) => fetch(...args),
    },
  });
}

// ---------- 2) Convenience helpers ----------
export function supabaseServer(req?: NextApiRequest, cookieHeader?: string): SupabaseClient<DB> {
  const headers: Record<string, string> = { 'X-Client-Info': 'gramorx/pages-router' };
  const cookie = cookieHeader ?? req?.headers?.cookie;
  if (cookie) headers['Cookie'] = String(cookie);

  return createClient<DB>(URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers,
      fetch: (...args) => fetch(...args),
    },
  });
}

export function supabaseService(): SupabaseClient<DB> {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseService() can only be used on the server.');
  }
  if (!SERVICE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  }

  return createClient<DB>(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { 'X-Client-Info': 'gramorx/pages-router-service' },
      fetch: (...args) => fetch(...args),
    },
  });
}

export async function getServerUser(req?: NextApiRequest) {
  const sb = supabaseServer(req);
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

// CJS-style default import support
export default createSupabaseServerClient;
