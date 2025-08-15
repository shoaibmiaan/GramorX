import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserServer } from '@/lib/authServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { attemptId } = (req.method === 'GET' ? req.query : req.body) as { attemptId?: string };
  if (!attemptId) return res.status(400).json({ error: 'attemptId required' });

  const { user, supabase } = await getUserServer(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('speaking_attempts')
    .select('id, prompts')
    .eq('id', attemptId)
    .single();
  if (error) return res.status(404).json({ error: error.message });

  res.status(200).json({ attemptId: data.id, prompts: data.prompts });
}
