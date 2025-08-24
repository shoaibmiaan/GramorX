<<<<<<< HEAD
// /lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// NOTE: This client is for server-side only (API routes / getServerSideProps).
// Do NOT import it in client components.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
=======
import { env } from "@/lib/env";
// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@/types/supabase'; // optional generated types
import { env } from '@/env';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!serviceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');

export const supabaseAdmin =
  globalThis.__supabaseAdmin ??
  createClient(/* <Database> */ url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

if (env.NODE_ENV !== 'production') {
  // @ts-ignore
  globalThis.__supabaseAdmin = supabaseAdmin;
}
>>>>>>> 4e94e6322611b22f93ab3e6364502036ed9a3d29
