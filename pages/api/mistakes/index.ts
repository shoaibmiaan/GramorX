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
      .from('mistakes_book')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { mistake, correction, type } = req.body as {
      mistake?: string; correction?: string; type?: string;
    };
    if (!mistake) {
      return res.status(400).json({ error: 'Missing mistake' });
    }
    const { data, error } = await supabase
      .from('mistakes_book')
      .insert({ user_id: user.id, mistake, correction, type })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id, ...fields } = req.body as { id?: string; [key: string]: any };
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const { data, error } = await supabase
      .from('mistakes_book')
      .update(fields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body as { id?: string };
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const { error } = await supabase
      .from('mistakes_book')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', 'GET,POST,PUT,DELETE');
  return res.status(405).end('Method Not Allowed');
}
