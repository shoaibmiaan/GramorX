import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/requireRole';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const supabase = createSupabaseServerClient({ serviceRole: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    await requireRole(req, ['teacher', 'admin']);
  } catch {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const { submissionId, final_score, comment } = req.body as {
    submissionId?: string;
    final_score?: number;
    comment?: string;
  };

  if (!submissionId || typeof final_score !== 'number') {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  try {
    const { error } = await supabase
      .from('submissions')
      .update({ final_score, override_comment: comment ?? null, overridden: true })
      .eq('id', submissionId);
    if (error) throw error;
    return res.json({ ok: true, data: { final_score, comment: comment ?? null } });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message ?? 'Server error' });
  }
}
