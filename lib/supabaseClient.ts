import { env } from "@/lib/env";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from '@/env';

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton client (safe for SSR/ISR selects on public tables)
export const supabase = createClient<Database>(url, anon, {
  auth: { persistSession: false },
});
