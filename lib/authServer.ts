// lib/authServer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSbClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookies-based client (Pages Router)
export function getSupabaseServer(req: NextApiRequest, res: NextApiResponse) {
  return createPagesServerClient({ req, res });
}

// Token-based client (when Authorization: Bearer <access_token> is sent)
export function getSupabaseForToken(accessToken: string) {
  return createSbClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Get user & a client that carries the user identity (cookies or bearer)
export async function getUserServer(req: NextApiRequest, res: NextApiResponse) {
  // Try cookies first
  const sbCookie = getSupabaseServer(req, res);
  const cookieUser = await sbCookie.auth.getUser();
  if (cookieUser.data?.user) return { user: cookieUser.data.user, supabase: sbCookie };

  // Fallback to Authorization header (or sb-access-token cookie)
  const hdr = req.headers.authorization;
  const token =
    hdr?.startsWith('Bearer ') ? hdr.slice(7) : (req.cookies['sb-access-token'] as string | undefined);
  if (!token) return { user: null, supabase: sbCookie };

  const sbToken = getSupabaseForToken(token);
  const tokenUser = await sbToken.auth.getUser();
  return { user: tokenUser.data?.user ?? null, supabase: sbToken };
}
