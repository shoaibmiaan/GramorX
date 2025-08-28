import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const ip = Array.isArray(req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for'][0]
    : req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'] || null;

  const { error } = await supabaseAdmin.from('login_events').insert({
    user_id: user.id,
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
