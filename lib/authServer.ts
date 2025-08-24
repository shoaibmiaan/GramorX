import { env } from "@/lib/env";
// lib/authServer.ts
import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || '';

function b64urlToJson(b64: string) {
  const pad = (s:string) => s + '=' * ((4 - (s.length % 4)) % 4);
  const str = Buffer.from(pad(b64).replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8');
  return JSON.parse(str);
}
function decodeUserId(token: string | null): string | null {
  if (!token) return null;
  try {
    const [_, payload] = token.split('.');
    const p = b64urlToJson(payload);
    return p.sub || p.user_id || null;
  } catch { return null; }
}

export type ServerAuth = {
  user: { id: string; email?: string } | null;
  supabaseDb: ReturnType<typeof createClient>;
  supabaseAuth: ReturnType<typeof createClient>;
  token: string | null;
};

export async function getUserServer(req: NextApiRequest): Promise<ServerAuth> {
  const authHeader = (req.headers.authorization as string) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Client used for auth/RLS-aware queries (carries the bearer)
  const supabaseAuth = createClient(URL, ANON, { global: { headers: { Authorization: authHeader } } });

  // Client used for storage/DB writes; prefers service role (bypasses RLS)
  const supabaseDb = SERVICE ? createClient(URL, SERVICE) : supabaseAuth;

  let userId: string | null = null;
  try {
    if (token) {
      const { data } = await supabaseAuth.auth.getUser(token);
      userId = data?.user?.id ?? decodeUserId(token);
    }
  } catch {
    userId = decodeUserId(token);
  }

  return { user: userId ? { id: userId } : null, supabaseDb, supabaseAuth, token };
}
