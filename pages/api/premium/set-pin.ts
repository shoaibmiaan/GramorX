// pages/api/premium/set-pin.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Resp =
  | { ok: true; status: 'CREATED' | 'UPDATED' }
  | { ok: false; reason: 'INVALID_CURRENT' | 'INVALID_NEW' | 'BAD_INPUT' }
  | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { currentPin, newPin } = body ?? {};
  if (!newPin) return res.status(400).json({ ok: false, reason: 'BAD_INPUT' });
  if (!/^\d{4,6}$/.test(String(newPin))) return res.status(400).json({ ok: false, reason: 'INVALID_NEW' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data, error } = await supabase.rpc('set_premium_pin', {
    current_pin: currentPin ?? null,
    new_pin: String(newPin),
  });

  if (error) return res.status(500).json({ error: error.message });

  if (data === 'CREATED' || data === 'UPDATED') return res.status(200).json({ ok: true, status: data });
  if (data === 'INVALID_CURRENT') return res.status(400).json({ ok: false, reason: 'INVALID_CURRENT' });
  if (data === 'INVALID_NEW') return res.status(400).json({ ok: false, reason: 'INVALID_NEW' });

  return res.status(400).json({ ok: false, reason: 'BAD_INPUT' });
}
