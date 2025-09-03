// lib/supabaseAdmin.ts
// Lightweight wrapper that exports a single cached admin (service-role) client.
// Named export: supabaseAdmin

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || (env as any).SUPABASE_SERVICE_KEY;

if (!url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL');
}
if (!serviceRoleKey && process.env.NODE_ENV !== 'test') {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (service role key required)');
}

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdmin: ReturnType<typeof createClient> | undefined;
}

export const supabaseAdmin =
  // reuse across HMR/dev
  // @ts-ignore
  globalThis.__supabaseAdmin ??
  createClient(url, serviceRoleKey ?? '', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (...args) => fetch(...args) },
  });

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  globalThis.__supabaseAdmin = supabaseAdmin;
}

export default supabaseAdmin;
