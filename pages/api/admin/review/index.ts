import type { NextApiRequest, NextApiResponse } from 'next';
import { requireRole } from '@/lib/requireRole';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const supabase = createSupabaseServerClient({ serviceRole: true });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    await requireRole(req, ['teacher', 'admin']);
  } catch {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const submissionId = typeof req.query.submissionId === 'string' ? req.query.submissionId : null;
  if (!submissionId) return res.status(400).json({ ok: false, error: 'Missing submissionId' });

  try {
    const { data, error } = await supabase
      .from('submissions_view_admin')
      .select('*')
      .eq('id', submissionId)
      .single();
    if (error) throw error;
    return res.json({ ok: true, data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message ?? 'Server error' });
  }
}
