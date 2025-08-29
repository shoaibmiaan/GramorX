import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category } = req.query as { category: string };
  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { resource_id, type } = req.query as { resource_id?: string; type?: string };
    let query = supabase
      .from('user_bookmarks')
      .select('resource_id, type, category, created_at')
      .eq('user_id', user.id)
      .eq('category', category);
    if (resource_id) query = query.eq('resource_id', resource_id);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { resource_id, type } = req.body as { resource_id?: string; type?: string };
    if (!resource_id) {
      return res.status(400).json({ error: 'Missing resource_id' });
    }
    const { error } = await supabase
      .from('user_bookmarks')
      .upsert({ user_id: user.id, resource_id, type: type || '', category });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { resource_id, type } = req.body as { resource_id?: string; type?: string };
    if (!resource_id) {
      return res.status(400).json({ error: 'Missing resource_id' });
    }
    let query = supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .eq('category', category);
    if (type) query = query.eq('type', type);
    const { error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return res.status(405).end('Method Not Allowed');
}
