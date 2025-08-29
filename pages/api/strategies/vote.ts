import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Json =
  | { ok: true; helpful: boolean }
  | { ok: false; error: string };

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

  const {
    tipId,
    action,
    helpful = true,
  }: { tipId?: string; action?: 'toggle' | 'set' | 'unset'; helpful?: boolean } = req.body || {};
  if (!tipId) return res.status(400).json({ ok: false, error: 'tipId is required' });

  const supabase = createSupabaseServerClient({ headers: { Authorization: `Bearer ${token}` } });

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user?.id) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
  const user_id = userData.user.id;

  try {
    // Do we already have a vote? (RLS → own rows only)
    const { data: existing } = await supabase
      .from('strategies_tip_votes')
      .select('tip_id')
      .eq('tip_id', tipId)
      .maybeSingle();

    const mode = action ?? 'toggle';

    if (mode === 'unset' || (mode === 'toggle' && !!existing)) {
      const { error } = await supabase
        .from('strategies_tip_votes')
        .delete()
        .eq('user_id', user_id)
        .eq('tip_id', tipId);
      if (error) throw error;
      return res.status(200).json({ ok: true, helpful: false });
    }

    // set / toggle (create)
    const { error } = await supabase
      .from('strategies_tip_votes')
      .insert({ user_id, tip_id: tipId, helpful: !!helpful });
    if (error) throw error;
    return res.status(200).json({ ok: true, helpful: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}
