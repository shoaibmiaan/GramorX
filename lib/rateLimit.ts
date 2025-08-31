import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from './redis';

const WINDOW_SEC = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? 60); // default 60s
const MAX_REQ = Number(process.env.RATE_LIMIT_MAX ?? 5); // default 5 requests per window

function getClientIp(req: NextApiRequest): string {
  const xf = (req.headers?.['x-forwarded-for'] as string | undefined)
    ?.split(',')[0]
    ?.trim();
  return xf || req.socket?.remoteAddress || 'unknown';
}

export async function rateLimit(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') return true;
  const ip = getClientIp(req);
  const key = `rl:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SEC);
  }

  if (typeof res.setHeader === 'function') {
    res.setHeader('X-RateLimit-Limit', MAX_REQ.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQ - count).toString());
  }

  if (count > MAX_REQ) {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Retry-After', WINDOW_SEC.toString());
    }
    res.status(429).json({ error: 'Too many requests' });
    return false;
  }
  return true;
}
