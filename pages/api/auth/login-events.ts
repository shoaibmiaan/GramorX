// pages/api/auth/login-events.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type LoginEventRow = {
  id: string;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const supabase = createSupabaseServerClient({ req });

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error('supabase.auth.getUser error', userErr);
    }
    const user = userRes?.user ?? null;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!supabaseAdmin || typeof (supabaseAdmin as any).from !== 'function') {
      console.error('supabaseAdmin client not available', { supabaseAdmin });
      return res.status(500).json({ error: 'Supabase admin client unavailable' });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('login_events')
      .select('id, created_at, ip_address, user_agent')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading login events', error);
      return res.status(500).json({ error: error.message ?? String(error) });
    }

    return res.status(200).json(data as LoginEventRow[]);
  } catch (err: any) {
    console.error('Unhandled error in login-events handler', err);
    return res.status(500).json({ error: err?.message ?? 'Internal Error' });
  }
}
