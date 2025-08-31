import type { NextApiRequest, NextApiResponse } from 'next';
import { randomInt } from 'crypto';
import { requireRole } from '@/lib/requireRole';

type Resp = { ok: true; pin: string } | { ok: false; error: string };

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQ = 10;
const hits = new Map<string, { count: number; time: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.time > WINDOW_MS) {
    hits.set(ip, { count: 1, time: now });
    return false;
  }
  entry.count++;
  entry.time = now;
  hits.set(ip, entry);
  return entry.count > MAX_REQ;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Resp>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    await requireRole(req, ['admin']);
  } catch {
    return res.status(403).json({ ok: false, error: 'NOT_ADMIN' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' });
  }

  const len = randomInt(4, 7); // length 4-6
  let pin = '';
  for (let i = 0; i < len; i++) {
    pin += randomInt(0, 10).toString();
  }

  return res.status(200).json({ ok: true, pin });
}
