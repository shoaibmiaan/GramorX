import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: bookmarks } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', user.id);

      return res.status(200).json({ profile, bookmarks });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Export failed' });
    }
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}
