import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, message, url, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
      const welcome = {
        id: 'welcome',
        message: 'Welcome to GramorX!',
        url: null,
        read: false,
        created_at: new Date().toISOString(),
      };
      return res.status(200).json({ notifications: [welcome], unread: 1 });
    }
    const unread = data.filter((n) => !n.read).length;
    return res.status(200).json({ notifications: data, unread });
  }

  if (req.method === 'POST') {
    const { message, url } = req.body as { message?: string; url?: string };
    if (!message) return res.status(400).json({ error: 'Missing message' });
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: user.id, message, url })
      .select('id, message, url, read, created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    const { count: unread } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    return res.status(201).json({ notification: data, unread });
  }

  if (req.method === 'PUT') {
    const { id } = req.body as { id?: string };
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    const { count: unread } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    return res.status(200).json({ success: true, unread });
  }

  res.setHeader('Allow', 'GET,POST,PUT');
  return res.status(405).end('Method Not Allowed');
}
