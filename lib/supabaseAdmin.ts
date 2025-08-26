import { env } from "@/lib/env";
import { createClient } from '@supabase/supabase-js';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin =
  globalThis.__supabaseAdmin ??
  createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

if (env.NODE_ENV !== 'production') {
  globalThis.__supabaseAdmin = supabaseAdmin;
}

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdmin: ReturnType<typeof createClient> | undefined;
}
