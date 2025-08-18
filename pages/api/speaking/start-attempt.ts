import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseFromRequest } from '@/lib/apiAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mode = 'exam', part } = (req.body ?? {}) as { mode?: string; part: 'p1'|'p2'|'p3' };
  if (!part) return res.status(400).json({ error: 'Missing part' });

  const supabase = supabaseFromRequest(req);
  // Insert as the authed user under RLS
  const { data, error } = await supabase
    .from('speaking_attempts')
    .insert({ mode, part })
    .select('id')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ attemptId: data.id });
}
