// lib/supabaseServer.ts
// Server-side Supabase helpers for Pages Router.
//
// Exports:
// - createSupabaseServerClient(opts)  // named + default
// - supabaseServer(req?, cookie?)     // anon client (for reading user/auth info)
// - supabaseService()                 // service-role client (server only)
// - getServerUser(req?)               // convenience helper
//
// Notes:
// - Test-friendly stubs are returned when NODE_ENV === 'test' or SKIP_ENV_VALIDATION === 'true'.
// - Replace `DB` with your actual Database type if available.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { env } from '@/lib/env';

// If you have generated types for your DB, swap `any` with that type.
// import type { Database } from '@/types/supabase';
// type DB = Database;
type DB = any;

type CreateOpts = {
  req?: NextApiRequest;
  serviceRole?: boolean;
  headers?: Record<string, string>;
};

const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = (env as any).SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

function makeTestStub() {
  // Minimal stub that has the methods used by our server handlers.
  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
    },
    from: (_table: string) => ({
      async insert(_rows: any) {
        return { data: null, error: null };
      },
      async select() {
        return { data: [], error: null };
      },
      async update() {
        return { data: null, error: null };
      },
      async delete() {
        return { data: null, error: null };
      },
    }),
  } as unknown as SupabaseClient<DB>;
}

/**
 * Generic factory to create a supabase client for server usage.
 * Use opts.serviceRole = true for service-role (server-only) client.
 */
export function createSupabaseServerClient<T = DB>(opts: CreateOpts = {}): SupabaseClient<T> {
  const isTest = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true';

  if (!URL || (!(ANON_KEY || SERVICE_KEY))) {
    if (isTest) {
      return makeTestStub() as unknown as SupabaseClient<T>;
    }
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / anon/service keys).');
  }

  const key = opts.serviceRole ? SERVICE_KEY : ANON_KEY;
  if (!key && !isTest) {
    throw new Error('Supabase key is missing for requested client.');
  }

  const headers: Record<string, string> = {
    'X-Client-Info': 'gramorx/pages-router',
    ...(opts.headers || {}),
  };

  // forward authorization header and cookies when present
  const authHeader = opts.req?.headers?.authorization;
  if (authHeader && !headers['Authorization']) headers['Authorization'] = String(authHeader);
  const cookieHeader = opts.req?.headers?.cookie;
  if (cookieHeader && !headers['Cookie']) headers['Cookie'] = String(cookieHeader);

  return createClient<T>(URL, String(key), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers,
      fetch: (...args) => fetch(...args),
    },
  });
}

/**
 * Simple convenience: anon client for server routes.
 * For most pages/api handlers that only need to read auth/user info.
 */
export function supabaseServer(req?: NextApiRequest, cookieHeader?: string): SupabaseClient<DB> {
  const isTest = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true';
  if (!URL || !ANON_KEY) {
    if (isTest) return makeTestStub();
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

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

/**
 * Server-only service-role client (must run on server).
 * Cached to globalThis to avoid recreation during dev hot reload.
 */
declare global {
  // eslint-disable-next-line no-var
  var __supabaseServiceClient: ReturnType<typeof createClient> | undefined;
}
export function supabaseService(): SupabaseClient<DB> {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseService() can only be used on the server.');
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true';
  if (!URL || !SERVICE_KEY) {
    if (isTest) return makeTestStub();
    throw new Error('Missing SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  }

  // reuse client across invocations in non-prod/dev
  // @ts-ignore - global caching
  if (globalThis.__supabaseServiceClient) {
    // @ts-ignore
    return globalThis.__supabaseServiceClient;
  }

  // create and cache
  // @ts-ignore
  globalThis.__supabaseServiceClient = createClient<DB>(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { 'X-Client-Info': 'gramorx/pages-router-service' },
      fetch: (...args) => fetch(...args),
    },
  });

  // @ts-ignore
  return globalThis.__supabaseServiceClient;
}

/**
 * Convenience: read the current server user (returns user object | null)
 */
export async function getServerUser(req?: NextApiRequest) {
  const sb = supabaseServer(req);
  try {
    const { data } = await sb.auth.getUser();
    return (data && (data.user ?? null)) || null;
  } catch (err) {
    return null;
  }
}

// CJS-style default export support
export default createSupabaseServerClient;
