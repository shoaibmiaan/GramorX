import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type LearnIn = { wordId?: string };
type LearnOut = { ok: true; learnedOn: string; streakDays: number } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<LearnOut>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split(' ')[1] ?? '';
  const { data: userRes, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !userRes?.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = userRes.user.id;

  const { wordId }: LearnIn = req.body ?? {};
  if (!wordId) return res.status(400).json({ error: 'wordId required' });

  const todayISO = new Date().toISOString().slice(0, 10);

  // Upsert once per day
  const { error: upErr } = await supabaseAdmin.from('user_word_logs').upsert(
    { user_id: userId, word_id: wordId, learned_on: todayISO },
    { onConflict: 'user_id,learned_on' }
  );
  if (upErr) return res.status(500).json({ error: 'Unable to mark learned' });

  const { data: streak } = await supabaseAdmin.rpc('calc_streak', { p_user: userId });

  return res.status(200).json({ ok: true, learnedOn: todayISO, streakDays: (streak as number) ?? 0 });
}
