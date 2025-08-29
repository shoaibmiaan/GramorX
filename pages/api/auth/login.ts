import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { redis } from '@/lib/redis';

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_SEC = 60 * 15; // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const ipRaw = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ip = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw.split(',')[0];
  const key = `login:fail:${ip}`;

  const attemptsStr = await redis.get(key);
  const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
  if (attempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many failed login attempts. Please try again later.' });
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    await redis.incr(key);
    await redis.expire(key, BLOCK_TIME_SEC);
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  await redis.del(key);
  return res.status(200).json({ session: data.session });
}
