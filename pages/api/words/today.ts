import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type TodayOut = {
  word: { id: string; word: string; meaning: string; example: string | null };
  learnedToday: boolean;
  streakDays: number;
  streakValueUSD: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns "Word of the Day" + streak info.
 * - Never throws; always responds with a valid JSON payload.
 * - If unauthenticated or an internal error occurs, returns safe defaults
 *   so the client UI never crashes (streak=0, learnedToday=false).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodayOut | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const date = todayISO();

  try {
    // Try to resolve user from Bearer (optional)
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : '';

    let userId: string | null = null;
    if (token) {
      const { data: userRes } = await supabaseAdmin.auth.getUser(token);
      userId = userRes?.user?.id ?? null;
    }

    // Get WOD (works regardless of auth)
    const { data: wod, error: wodErr } = await supabaseAdmin
      .rpc('get_word_of_day', { d: date })
      .single();

    // Fallback word if RPC fails
    const word = wodErr || !wod
      ? { id: 'fallback', word: 'persevere', meaning: 'continue in a course of action even in the face of difficulty', example: 'Persevere through practice to reach Band 8+.' }
      : { id: wod.id, word: wod.word, meaning: wod.meaning, example: wod.example ?? null };

    // If no user, return public view with zeroed streak
    if (!userId) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({
        word,
        learnedToday: false,
        streakDays: 0,
        streakValueUSD: 0,
      });
    }

    // Learned today?
    const { data: learnedRow } = await supabaseAdmin
      .from('user_word_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('learned_on', date)
      .maybeSingle();

    // Streak (RPC should return a number; coerce safely)
    const { data: streak } = await supabaseAdmin.rpc('calc_streak', { p_user: userId });
    const streakDays = Number.isFinite(streak as number) ? (streak as number) : 0;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      word,
      learnedToday: Boolean(learnedRow),
      streakDays,
      streakValueUSD: streakDays * 0.5, // $0.50 per day (display-only)
    });
  } catch {
    // Final safety net: still return a valid payload
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      word: {
        id: 'fallback',
        word: 'persevere',
        meaning: 'continue in a course of action even in the face of difficulty',
        example: 'Persevere through practice to reach Band 8+.',
      },
      learnedToday: false,
      streakDays: 0,
      streakValueUSD: 0,
    });
  }
}
