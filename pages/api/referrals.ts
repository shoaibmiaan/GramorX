import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseFromRequest } from '@/lib/apiAuth';
import { supabaseService } from '@/lib/supabaseService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const authed = supabaseFromRequest(req);
    const { data: userData, error: userErr } = await authed.auth.getUser();
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = userData.user.id;

    // Ensure referral code exists
    let { data: codeData } = await supabaseService
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .maybeSingle();

    if (!codeData) {
      let code: string;
      do {
        code = Math.random().toString(36).slice(2, 8).toUpperCase();
        const { data: exists } = await supabaseService
          .from('referral_codes')
          .select('user_id')
          .eq('code', code)
          .maybeSingle();
        if (!exists) break;
      } while (true);
      const { data: inserted, error: insertErr } = await supabaseService
        .from('referral_codes')
        .insert({ user_id: userId, code })
        .select('code')
        .single();
      if (insertErr) return res.status(500).json({ error: 'Could not create code' });
      codeData = inserted;
    }

    const { data: invites } = await supabaseService
      .from('referral_signups')
      .select('referred_id, reward_credits, reward_issued, created_at')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    return res.status(200).json({ code: codeData.code, invites: invites || [] });
  }

  if (req.method === 'POST') {
    const { code } = (req.body || {}) as { code?: string };
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const authed = supabaseFromRequest(req);
    const { data: userData, error: userErr } = await authed.auth.getUser();
    if (userErr || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = userData.user.id;

    const { data: ref } = await supabaseService
      .from('referral_codes')
      .select('user_id')
      .eq('code', code)
      .maybeSingle();

    if (!ref?.user_id || ref.user_id === userId) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const { error: insertErr } = await supabaseService
      .from('referral_signups')
      .insert({ referrer_id: ref.user_id, referred_id: userId, reward_credits: 50 });

    if (insertErr) {
      return res.status(500).json({ error: 'Could not record referral' });
    }

    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
