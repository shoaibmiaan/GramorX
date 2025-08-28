// lib/apiAuth.ts
import type { NextApiRequest } from 'next';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export function supabaseFromRequest(req: NextApiRequest): SupabaseClient {
  return createSupabaseServerClient({ req });
}
