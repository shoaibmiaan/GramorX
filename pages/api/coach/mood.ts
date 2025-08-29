import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function getLastMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0,0,0,0);
  return d;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient({ req });

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceStr = since.toISOString().split('T')[0];

    const { data: logs, error: logsErr } = await supabase
      .from('mood_logs')
      .select('id, entry_date, mood, energy, note')
      .eq('user_id', user.id)
      .gte('entry_date', sinceStr)
      .order('entry_date', { ascending: false });

    const { data: reflection, error: reflErr } = await supabase
      .from('weekly_reflections')
      .select('id, week_start, reflection')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logsErr || reflErr) {
      return res.status(500).json({ error: logsErr?.message || reflErr?.message });
    }

    return res.status(200).json({ logs: logs || [], reflection });
  }

  if (req.method === 'POST') {
    const { type } = req.body;
    if (type === 'daily') {
      const { mood, energy, note, date } = req.body;
      const { error } = await supabase
        .from('mood_logs')
        .insert({
          user_id: user.id,
          entry_date: date || new Date().toISOString().split('T')[0],
          mood,
          energy,
          note
        });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }
    if (type === 'weekly') {
      const { reflection, week_start } = req.body;
      const ws = week_start || getLastMonday(new Date()).toISOString().split('T')[0];
      const { error } = await supabase
        .from('weekly_reflections')
        .insert({
          user_id: user.id,
          week_start: ws,
          reflection
        });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
