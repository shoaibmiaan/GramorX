import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anon, {
    global: { headers: { Cookie: req.headers.cookie || '' } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      await supabaseAdmin.from('user_profiles').delete().eq('user_id', user.id);
      await supabaseAdmin.from('user_bookmarks').delete().eq('user_id', user.id);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Deletion failed' });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
