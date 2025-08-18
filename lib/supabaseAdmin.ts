// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@/types/supabase'; // optional generated types

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin =
  globalThis.__supabaseAdmin ??
  createClient(/* <Database> */ url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  globalThis.__supabaseAdmin = supabaseAdmin;
}
