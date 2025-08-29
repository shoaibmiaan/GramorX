import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type StreakResponse = {
  current_streak: number;
  last_activity_date: string | null;
  shields: number;
};
type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<StreakResponse | ErrorResponse>) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data: streakData, error: streakErr } = await supabase
      .from('user_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle();
    const { data: shieldData, error: shieldErr } = await supabase
      .from('streak_shields')
      .select('tokens')
      .eq('user_id', user.id)
      .maybeSingle();

    if (streakErr || shieldErr) {
      return res.status(500).json({ error: streakErr?.message || shieldErr?.message || 'Failed to fetch' });
    }

    return res.status(200).json({
      current_streak: streakData?.current_streak ?? 0,
      last_activity_date: streakData?.last_activity_date ?? null,
      shields: shieldData?.tokens ?? 0,
    });
  }

  if (req.method === 'POST') {
    const { action } = (req.body as { action?: string }) || {};
    const today = new Date().toISOString().split('T')[0];
    const { data: existing, error: fetchErr } = await supabase
      .from('user_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle();
    const { data: shieldRow, error: shieldErr } = await supabase
      .from('streak_shields')
      .select('tokens')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchErr || shieldErr) {
      return res.status(500).json({ error: fetchErr?.message || shieldErr?.message || 'Fetch failed' });
    }

    const currentTokens = shieldRow?.tokens ?? 0;

    if (action === 'claim') {
      const tokens = currentTokens + 1;
      const { error: upsertErr } = await supabase
        .from('streak_shields')
        .upsert({ user_id: user.id, tokens });
      if (upsertErr) {
        return res.status(500).json({ error: upsertErr.message });
      }
      await supabase.from('streak_shield_logs').insert({ user_id: user.id, action: 'claim' });
      return res.status(200).json({
        current_streak: existing?.current_streak ?? 0,
        last_activity_date: existing?.last_activity_date ?? null,
        shields: tokens,
      });
    }

    let newStreak = 1;
    let shields = currentTokens;

    if (action === 'use' && currentTokens > 0) {
      newStreak = (existing?.current_streak ?? 0) + 1;
      shields = currentTokens - 1;
    } else if (existing) {
      if (existing.last_activity_date === today) {
        newStreak = existing.current_streak;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().split('T')[0];
        if (existing.last_activity_date === y) {
          newStreak = existing.current_streak + 1;
        }
      }
    }

    const { error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        current_streak: newStreak,
        last_activity_date: today,
      });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (action === 'use' && currentTokens > 0) {
      const { error: shieldUpdateErr } = await supabase
        .from('streak_shields')
        .upsert({ user_id: user.id, tokens: shields });
      if (shieldUpdateErr) {
        return res.status(500).json({ error: shieldUpdateErr.message });
      }
      await supabase.from('streak_shield_logs').insert({ user_id: user.id, action: 'use' });
    }

    return res.status(200).json({ current_streak: newStreak, last_activity_date: today, shields });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
