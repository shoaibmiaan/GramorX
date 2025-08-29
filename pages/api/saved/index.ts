import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { resource_id, type, category } = req.query as {
      resource_id?: string;
      type?: string;
      category?: string;
    };
    let query = supabase
      .from('user_bookmarks')
      .select('resource_id, type, category, created_at')
      .eq('user_id', user.id);
    if (resource_id) query = query.eq('resource_id', resource_id);
    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.setHeader('Allow', 'GET');
  return res.status(405).end('Method Not Allowed');
}
