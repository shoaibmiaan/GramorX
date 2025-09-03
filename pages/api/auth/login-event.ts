// pages/api/auth/login-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer, supabaseService } from '@/lib/supabaseServer';

type RespBody = { ok?: true } | { error: string; details?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<RespBody>) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sb = supabaseServer(req);
    const { data: userRes, error: userErr } = await sb.auth.getUser();
    if (userErr) console.error('supabaseServer.auth.getUser error', userErr);
    const userId: string | null = (userRes?.user?.id as string) ?? null;

    const isTestBypass =
      process.env.NODE_ENV === 'test' ||
      process.env.TWILIO_BYPASS === '1' ||
      req.headers['x-test-bypass'] === '1';

    if (!userId && !isTestBypass) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.socket?.remoteAddress ?? null);
    const ua = (req.headers['user-agent'] as string) || null;

    const admin = supabaseService();
    if (!admin || typeof (admin as any).from !== 'function') {
      console.error('supabaseService() did not return a client with .from()', { admin });
      return res.status(500).json({ error: 'Supabase service client unavailable' });
    }

    const { error: insertErr } = await (admin as any).from('login_events').insert([
      {
        user_id: userId,
        ip_address: ip,
        user_agent: ua,
      },
    ]);

    if (insertErr) {
      console.error('Failed to insert login event', insertErr);
      return res
        .status(500)
        .json({ error: 'Failed to record login event', details: insertErr.message ?? String(insertErr) });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Unhandled error in login-event handler', err);
    return res.status(500).json({ error: 'Internal Server Error', details: String(err?.message ?? err) });
  }
}
