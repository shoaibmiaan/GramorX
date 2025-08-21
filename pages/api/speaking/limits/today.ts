import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserServer } from '@/lib/authServer';
const DAILY_LIMIT = parseInt(env.SPEAKING_DAILY_LIMIT || '5', 10);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user, supabase } = await getUserServer(req, res);
  if (!user) return res.status(200).json({ attemptsToday: 0, limit: DAILY_LIMIT, ok: false });

  const { count, error } = await supabase
    .from('speaking_attempts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  if (error) return res.status(200).json({ attemptsToday: 0, limit: DAILY_LIMIT, ok: true });

  res.status(200).json({ attemptsToday: count ?? 0, limit: DAILY_LIMIT, ok: true });
}
