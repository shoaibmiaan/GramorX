import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

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

  if (req.method === 'GET') {
    const { resource_id, type } = req.query as { resource_id?: string; type?: string };
    let query = supabase
      .from('user_bookmarks')
      .select('resource_id, type, created_at')
      .eq('user_id', user.id);
    if (resource_id) query = query.eq('resource_id', resource_id);
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { resource_id, type } = req.body as { resource_id?: string; type?: string };
    if (!resource_id || !type) {
      return res.status(400).json({ error: 'Missing resource_id or type' });
    }
    const { error } = await supabase
      .from('user_bookmarks')
      .upsert({ user_id: user.id, resource_id, type });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { resource_id, type } = req.body as { resource_id?: string; type?: string };
    if (!resource_id || !type) {
      return res.status(400).json({ error: 'Missing resource_id or type' });
    }
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resource_id)
      .eq('type', type);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return res.status(405).end('Method Not Allowed');
}
