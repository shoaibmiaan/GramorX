import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserServer } from '@/lib/authServer';
import { randomPrompts } from '@/lib/speaking/promptBank';

const DAILY_LIMIT = parseInt(process.env.SPEAKING_DAILY_LIMIT || '5', 10);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { user, supabase } = await getUserServer(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Limit attempts in the last 24h
    const { count, error: countErr } = await supabase
      .from('speaking_attempts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString());
    if (countErr) return res.status(500).json({ error: countErr.message });
    if ((count ?? 0) >= DAILY_LIMIT) return res.status(429).json({ error: 'Daily limit reached', limit: DAILY_LIMIT });

    const prompts = randomPrompts();

    // IMPORTANT: some schemas have a legacy NOT NULL "parts" column.
    // Insert BOTH fields to avoid "null value in column 'parts'" errors.
    const { data, error } = await supabase
      .from('speaking_attempts')
      .insert({ user_id: user.id, prompts, parts: prompts })
      .select('id, prompts')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ attemptId: data.id, prompts: data.prompts });
  } catch (e: any) {
    console.error('start-attempt error', e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}
