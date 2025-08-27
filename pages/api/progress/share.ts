import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { global: { headers: { Cookie: req.headers.cookie || '' } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabaseAdmin
      .from('progress_share_links')
      .insert({ user_id: user.id })
      .select('token')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ token: data.token });
  }

  if (req.method === 'GET') {
    const token = req.query.token;
    if (typeof token !== 'string') {
      return res.status(400).json({ error: 'Token required' });
    }

    const { data: link, error } = await supabaseAdmin
      .from('progress_share_links')
      .select('user_id')
      .eq('token', token)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!link) return res.status(404).json({ error: 'Invalid token' });

    const { data: reading } = await supabaseAdmin
      .from('reading_user_stats')
      .select('attempts,total_score,total_max,accuracy_pct,avg_duration_ms,last_attempt_at')
      .eq('user_id', link.user_id)
      .maybeSingle();

    return res.status(200).json({ user_id: link.user_id, reading });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
