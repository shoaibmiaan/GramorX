// pages/api/premium/pin-status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Resp = { exists: boolean } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createSupabaseServerClient({ headers: { Authorization: auth } });

  const { data, error } = await supabase.rpc('has_premium_pin');
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ exists: Boolean(data) });
}
