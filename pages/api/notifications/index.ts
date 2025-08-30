import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, url, read_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const list = data ?? [];
    if (list.length === 0) {
      const welcome = {
        id: 'welcome',
        title: 'Welcome to GramorX!',
        body: null,
        url: null,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      return res.status(200).json({ notifications: [welcome], unread: 1 });
    }
    return res.status(200).json({ notifications: list, unread: list.filter(n => !n.read_at).length });
  }

  if (req.method === 'POST') {
    const { title, body, url } = req.body as { title?: string; body?: string; url?: string };
    if (!title && !body) return res.status(400).json({ error: 'Missing title or body' });
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: user.id, title, body, url })
      .select('id, title, body, url, read_at, created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ notification: data });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).end('Method Not Allowed');
}
