// lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import { env } from '@/lib/env';

type Options = {
  req?: NextApiRequest;
  serviceRole?: boolean;
  headers?: Record<string, string>;
};

export function createSupabaseServerClient<T = any>(
  opts: Options = {}
): SupabaseClient<T> {
  const URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!URL || !(ANON_KEY || SERVICE_ROLE_KEY)) {
    throw new Error('Supabase env vars are missing');
  }

  const key = opts.serviceRole ? SERVICE_ROLE_KEY : ANON_KEY;
  const headers: Record<string, string> = { ...(opts.headers || {}) };

  const authHeader = opts.req?.headers?.authorization;
  if (authHeader && !headers['Authorization']) headers['Authorization'] = String(authHeader);

  const cookieHeader = opts.req?.headers?.cookie;
  if (cookieHeader && !headers['Cookie']) headers['Cookie'] = String(cookieHeader);

  return createClient<T>(URL, key, {
    global: { headers },
  });
}

// Also provide a default for any CJS-style imports
export default createSupabaseServerClient;
