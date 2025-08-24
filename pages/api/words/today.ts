import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type TodayOut = {
  word: { id: string; word: string; meaning: string; example: string | null };
  learnedToday: boolean;
  streakDays: number;
  streakValueUSD: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<TodayOut | { error: string }>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Auth: user from Bearer token
  const token = req.headers.authorization?.split(' ')[1] ?? '';
  const { data: userRes, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !userRes?.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = userRes.user.id;

  const todayISO = new Date().toISOString().slice(0, 10);

  // Word of the day via RPC
  const { data: wod, error: wodErr } = await supabaseAdmin
    .rpc('get_word_of_day', { d: todayISO })
    .single();

  if (wodErr || !wod) return res.status(500).json({ error: 'Failed to fetch word of the day' });

  // Learned today?
  const { data: learnedRow } = await supabaseAdmin
    .from('user_word_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('learned_on', todayISO)
    .maybeSingle();

  // Streak
  const { data: streak } = await supabaseAdmin.rpc('calc_streak', { p_user: userId });

  const payload: TodayOut = {
    word: { id: wod.id, word: wod.word, meaning: wod.meaning, example: wod.example ?? null },
    learnedToday: Boolean(learnedRow),
    streakDays: (streak as number) ?? 0,
    streakValueUSD: ((streak as number) ?? 0) * 0.5, // $0.50 per day (display-only)
  };

  return res.status(200).json(payload);
}
