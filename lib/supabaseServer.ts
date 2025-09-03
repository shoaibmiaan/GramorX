// lib/supabaseServer.ts
// Server-side Supabase helpers for Pages Router.
// Exported helpers:
// - createSupabaseServerClient(opts)
// - supabaseServer(req?, cookie?)
// - supabaseService()
// - getServerUser(req?)

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { env } from '@/lib/env';

// Replace `any` with your generated Database type when available
type DB = any;

type CreateOpts = {
  req?: NextApiRequest;
  serviceRole?: boolean;
  headers?: Record<string, string>;
};

/** Small, reliable Promise-returning helper for stubbed results */
const resolved = (payload: any) => Promise.resolve(payload);

/** Test-friendly stub that mirrors the minimal supabase client surface used in handlers/tests */
function makeTestStub(): SupabaseClient<DB> {
  const fromHandler = (_table: string) => ({
    async insert(rows: any) {
      // mimic supabase insert response shape
      return resolved({ data: Array.isArray(rows) ? rows.map((r, i) => ({ id: `stub-${i + 1}`, ...r })) : [{ id: 'stub-1', ...rows }], error: null });
    },
    async select(_cols?: string) {
      return resolved({ data: [], error: null });
    },
    async update(_rows: any) {
      return resolved({ data: null, error: null });
    },
    async delete() {
      return resolved({ data: null, error: null });
    },
  });

  return {
    auth: {
      async getUser() {
        return resolved({ data: { user: null }, error: null });
      },
      async getSession() {
        return resolved({ data: { session: null }, error: null });
      },
    },
    from: fromHandler,
  } as unknown as SupabaseClient<DB>;
}

const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = (env as any).SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Generic factory to create supabase server client. Use opts.serviceRole=true for a service-role client.
 */
export function createSupabaseServerClient<T = DB>(opts: CreateOpts = {}): SupabaseClient<T> {
  const isTest = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true';
  if (!URL || (!(ANON_KEY || SERVICE_KEY))) {
    if (isTest) return makeTestStub() as unknown as SupabaseClient<T>;
    throw new Error('Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / anon/service keys).');
  }

  const key = opts.serviceRole ? SERVICE_KEY : ANON_KEY;
  if (!key && !isTest) throw new Error('Supabase key is missing for requested client.');

  const headers: Record<string, string> = {
    'X-Client-Info': 'gramorx/pages-router',
    ...(opts.headers || {}),
  };

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
 * Convenience anon client for server routes (for reading auth / user info).
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
 * Service-role client (server-only). Cached on globalThis to avoid recreation across HMR.
 */
declare global {
  // eslint-disable-next-line no-var
  var __supabaseServiceClient: ReturnType<typeof createClient> | undefined;
}
export function supabaseService(): SupabaseClient<DB> {
  if (typeof window !== 'undefined') throw new Error('supabaseService() can only be used on the server.');

  const isTest = process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true';
  if (!URL || !SERVICE_KEY) {
    if (isTest) return makeTestStub();
    throw new Error('Missing SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  }

  // reuse existing client if present
  // @ts-ignore
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
 * Convenience helper to return the server user (or null).
 */
export async function getServerUser(req?: NextApiRequest) {
  const sb = supabaseServer(req);
  try {
    const { data } = await sb.auth.getUser();
    return (data && (data.user ?? null)) || null;
  } catch {
    return null;
  }
}

// Default export for CJS compatibility
export default createSupabaseServerClient;
