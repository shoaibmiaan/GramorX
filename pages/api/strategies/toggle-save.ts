import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Json =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getAccessToken(req: NextApiRequest) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice('Bearer '.length);
  if (typeof req.body?.token === 'string') return req.body.token;
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Json>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ ok: false, error: 'Missing access token' });

  const { tipId, action }: { tipId?: string; action?: 'toggle' | 'save' | 'unsave' } = req.body || {};
  if (!tipId) return res.status(400).json({ ok: false, error: 'tipId is required' });

  // RLS-aware client, acting as the logged-in user
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Verify user
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user?.id) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
  const user_id = userData.user.id;

  try {
    // Check if already saved (RLS ensures we only see our own rows)
    const { data: existing } = await supabase
      .from('strategies_tip_saves')
      .select('tip_id')
      .eq('tip_id', tipId)
      .maybeSingle();

    const mode = action ?? 'toggle';

    if ((mode === 'toggle' && !!existing) || mode === 'unsave') {
      const { error } = await supabase
        .from('strategies_tip_saves')
        .delete()
        .eq('user_id', user_id)
        .eq('tip_id', tipId);
      if (error) throw error;
      return res.status(200).json({ ok: true, saved: false });
    } else if ((mode === 'toggle' && !existing) || mode === 'save') {
      const { error } = await supabase
        .from('strategies_tip_saves')
        .insert({ user_id, tip_id: tipId });
      if (error) throw error;
      return res.status(200).json({ ok: true, saved: true });
    } else {
      return res.status(400).json({ ok: false, error: 'Invalid action' });
    }
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}
