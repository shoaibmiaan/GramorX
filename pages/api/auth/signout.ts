// pages/api/auth/signout.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Clears Supabase auth cookies set by the Next.js helpers (if used).
 * Safe to call even if you don't use the helpers.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Invalidate cookies by setting them expired (names used by supabase-auth-helpers)
  // If your cookie names differ, add them here.
  const cookies = [
    'sb-access-token',
    'sb-refresh-token',
    'sb:token',
    'supabase-auth-token', // legacy
  ];

  cookies.forEach((name) => {
    res.setHeader('Set-Cookie', [
      `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
      ...(Array.isArray(res.getHeader('Set-Cookie')) ? (res.getHeader('Set-Cookie') as string[]) : []),
    ]);
  });

  res.status(200).json({ ok: true });
}
