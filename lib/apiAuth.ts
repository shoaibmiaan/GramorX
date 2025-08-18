// lib/apiAuth.ts
import type { NextApiRequest } from 'next';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseFromRequest(req: NextApiRequest): SupabaseClient {
  const auth = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
  return createClient(url, anon, {
    global: { headers: auth ? { Authorization: auth } : {} },
  });
}
