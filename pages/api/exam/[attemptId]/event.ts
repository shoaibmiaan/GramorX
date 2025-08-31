import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const supabase = createSupabaseServerClient({ req });
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { attemptId } = req.query;
  if (typeof attemptId !== 'string') {
    return res.status(400).json({ error: 'Invalid attemptId' });
  }

  const { type } = (req.body || {}) as { type?: string };
  if (typeof type !== 'string') {
    return res.status(400).json({ error: 'Missing event type' });
  }

  const { error } = await supabase.from('exam_events').insert({
    attempt_id: attemptId,
    user_id: user.id,
    event_type: type,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
