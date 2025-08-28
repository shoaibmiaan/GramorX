import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const attemptId = String(req.query.attemptId || '');
  if (!attemptId) return res.status(400).json({ error: 'attemptId required' });

  const supabase = createSupabaseServerClient({ serviceRole: true });

  const { data, error } = await supabase
    .from('writing_reevals')
    .select('id, band_overall, band_breakdown, mode, created_at')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ rows: data });
}
