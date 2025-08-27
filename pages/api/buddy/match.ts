import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseFromRequest } from '@/lib/apiAuth';
import { supabaseService } from '@/lib/supabaseService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { timezone, goalBand } = (req.body || {}) as { timezone?: string; goalBand?: number };
  if (!timezone || !goalBand) {
    return res.status(400).json({ error: 'Missing timezone or goalBand' });
  }

  const authed = supabaseFromRequest(req);
  const { data: userData, error: userErr } = await authed.auth.getUser();
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = userData.user.id;

  // Try to find a waiting buddy
  const { data: match } = await supabaseService
    .from('study_buddies')
    .select('id, user_id')
    .eq('timezone', timezone)
    .eq('goal_band', goalBand)
    .is('buddy_id', null)
    .neq('user_id', userId)
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if (match) {
    await supabaseService
      .from('study_buddies')
      .update({ buddy_id: userId, status: 'matched', matched_at: new Date().toISOString() })
      .eq('id', match.id);
    return res.status(200).json({ matched: true, buddyId: match.user_id });
  }

  // Otherwise, insert this user as waiting
  await supabaseService.from('study_buddies').insert({
    user_id: userId,
    timezone,
    goal_band: goalBand,
    status: 'waiting'
  });

  return res.status(200).json({ matched: false });
}
