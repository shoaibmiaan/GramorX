// pages/api/premium/signout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/lib/env';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const parts = [
    `pr_pin_ok=`,
    `Path=/premium`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
  ];
  if (env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
  res.status(200).json({ ok: true });
}