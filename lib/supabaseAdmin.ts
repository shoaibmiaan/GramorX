// lib/supabaseAdmin.ts
// Exports a cached admin (service-role) client for server-only usage.

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// URL & service key (support either naming)
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || (env as any).SUPABASE_SERVICE_KEY;

if (!url && process.env.NODE_ENV !== 'test') {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL');
}
if (!serviceRoleKey && process.env.NODE_ENV !== 'test') {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (service role key required)');
}

/** Test stub for admin client used in CI/test environments */
function makeAdminTestStub() {
  const fromHandler = (_table: string) => ({
    async insert(rows: any) {
      return Promise.resolve({ data: Array.isArray(rows) ? rows.map((r, i) => ({ id: `stub-${i + 1}`, ...r })) : [{ id: 'stub-1', ...rows }], error: null });
    },
    async select(_cols?: string) {
      return Promise.resolve({ data: [], error: null });
    },
    async update(_rows: any) {
      return Promise.resolve({ data: null, error: null });
    },
    async delete() {
      return Promise.resolve({ data: null, error: null });
    },
  });

  return {
    auth: {
      async getUser() {
        return Promise.resolve({ data: { user: null }, error: null });
      },
      async getSession() {
        return Promise.resolve({ data: { session: null }, error: null });
      },
    },
    from: fromHandler,
  } as any;
}

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdmin: ReturnType<typeof createClient> | undefined;
}

export const supabaseAdmin =
  // reuse cached client when available
  // @ts-ignore
  globalThis.__supabaseAdmin ??
  (() => {
    if (process.env.NODE_ENV === 'test' && !serviceRoleKey) {
      return makeAdminTestStub();
    }
    // create a real client (service role key required)
    const key = serviceRoleKey ?? '';
    // @ts-ignore
    const client = createClient(url!, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (...args) => fetch(...args) },
    });
    // cache for HMR/dev
    // @ts-ignore
    globalThis.__supabaseAdmin = client;
    return client;
  })();

// default export (compat)
export default supabaseAdmin;
