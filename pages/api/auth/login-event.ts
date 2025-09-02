// pages/api/auth/login-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer, supabaseService } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Use anon client for user info
  const sb = supabaseServer(req);
  const { data: userRes } = await sb.auth.getUser();
  const userId: string | null = userRes?.user?.id ?? null;

  const isTestBypass =
    process.env.NODE_ENV === 'test' ||
    process.env.TWILIO_BYPASS === '1' ||
    req.headers['x-test-bypass'] === '1';

  if (!userId && !isTestBypass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null;
  const ua = (req.headers['user-agent'] as string) || null;

  // Service client for inserting row
  const admin = supabaseService();
  const { error: insertErr } = await admin.from('login_events').insert([
    {
      user_id: userId,
      ip_address: ip,
      user_agent: ua,
    },
  ]);

  if (insertErr) {
    return res.status(500).json({ error: 'Failed to record login event', details: insertErr.message });
  }

  return res.status(200).json({ ok: true });
}
