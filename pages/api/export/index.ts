import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const supabase = createSupabaseServerClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const profile = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    const bookmarks = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id);

    return res.status(200).json({
      profile: profile.data || null,
      bookmarks: bookmarks.data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Export failed' });
  }
}
