// lib/supabaseServer.ts
import { env } from '@/lib/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { NextApiRequest } from 'next';
import type { IncomingMessage } from 'http';

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

type ReqLike =
  | NextApiRequest
  | (IncomingMessage & {
      cookies?: Partial<Record<string, string>>;
      headers: IncomingMessage['headers'];
    });

type Options = {
  /** Pass req from API routes or getServerSideProps (ctx.req) */
  req?: ReqLike;
  /** Use service role key when you really need it (never expose to client) */
  serviceRole?: boolean;
  /** Extra headers to merge (will not overwrite Authorization unless you set it) */
  headers?: Record<string, string>;
};

/** Safely read a cookie value from req (supports Next API + GSSP req) */
function readCookie(req: ReqLike | undefined, name: string): string | undefined {
  if (!req) return undefined;
  // Prefer typed cookies (Next API / Next 13)
  const direct = (req as any).cookies?.[name];
  if (typeof direct === 'string') return direct;
  // Fallback: parse Cookie header
  const raw = req.headers?.cookie;
  if (!raw) return undefined;
  const parts = raw.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.split('=');
    if (k && k.trim() === name) return decodeURIComponent(rest.join('=').trim());
  }
  return undefined;
}

/** Extract a Bearer token from Authorization header OR Supabase cookie */
function bearerFromReq(req: ReqLike | undefined): string | undefined {
  if (!req) return undefined;
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  // Supabase cookie set by auth-helpers or your own API
  const cookieJwt = readCookie(req, 'sb-access-token');
  return cookieJwt || undefined;
}

/**
 * Server-side Supabase client that:
 * - Accepts API or GSSP requests (ctx.req)
 * - Auto-injects Authorization from `sb-access-token` cookie if present
 * - Disables local session persistence/refresh (server-safe)
 */
export function createSupabaseServerClient<T = any>(opts: Options = {}): SupabaseClient<T> {
  const key = opts.serviceRole ? SERVICE_ROLE_KEY : ANON_KEY;

  const headers: Record<string, string> = { ...(opts.headers || {}) };

  // 1) Authorization: prefer explicit header, else lift from cookie
  if (!headers['Authorization'] && !headers['authorization']) {
    const token = bearerFromReq(opts.req);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // 2) Forward Cookie header (not strictly required when Authorization is set,
  //    but harmless and can help with other middlewares).
  const cookieHeader =
    (opts.req?.headers as any)?.cookie || (opts.req?.headers as any)?.Cookie;
  if (cookieHeader && !headers['Cookie']) {
    headers['Cookie'] = String(cookieHeader);
  }

  return createClient<T>(URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: { headers },
  });
}
