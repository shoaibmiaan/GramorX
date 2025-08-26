import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type StreakResponse = { current_streak: number; last_activity_date: string | null };
type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<StreakResponse | ErrorResponse>) {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Cookie: req.headers.cookie || '' } } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      current_streak: data?.current_streak ?? 0,
      last_activity_date: data?.last_activity_date ?? null,
    });
  }

  if (req.method === 'POST') {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing, error: fetchErr } = await supabase
      .from('user_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message });
    }

    let newStreak = 1;
    if (existing) {
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

    return res.status(200).json({ current_streak: newStreak, last_activity_date: today });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
