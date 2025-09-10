import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type NotifRow = {
  id: string;
  message: string;
  url: string | null;
  read: boolean;
  created_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, message, url, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const list = (data ?? []) as NotifRow[];

    if (list.length === 0) {
      // default welcome for empty inbox
      const welcome: NotifRow = {
        id: 'welcome',
        message: 'Welcome to GramorX!',
        url: null,
        read: false,
        created_at: new Date().toISOString(),
      };
      return res.status(200).json({ notifications: [welcome], unread: 1 });
    }

    return res
      .status(200)
      .json({ notifications: list, unread: list.filter((n) => !n.read).length });
  }

  if (req.method === 'POST') {
    const { message, url } = req.body as { message?: string; url?: string };
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const { data: created, error } = await supabase
      .from('notifications')
      .insert({ user_id: user.id, message, url: url ?? null, read: false })
      .select('id, message, url, read, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ notification: created });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).end('Method Not Allowed');
}
