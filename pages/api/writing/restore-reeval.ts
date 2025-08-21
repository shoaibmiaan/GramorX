import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { createServerSupabaseClient } = await import('@supabase/auth-helpers-nextjs');
  const supa = createServerSupabaseClient({ req, res });
  const { data: auth } = await supa.auth.getUser();
  if (!auth?.user) return res.status(401).json({ error: 'Not authenticated' });

  const { data: profile } = await supa.from('profiles').select('is_admin').eq('id', auth.user.id).single();
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admins only' });

  const { reevalId } = req.body as { reevalId?: string };
  if (!reevalId) return res.status(400).json({ error: 'reevalId is required' });

  const admin = supabaseAdmin();
  const { data: row, error: e1 } = await admin
    .from('writing_reevals')
    .select('id, attempt_id, band_overall, band_breakdown, feedback')
    .eq('id', reevalId)
    .single();

  if (e1 || !row) return res.status(404).json({ error: 'Re-eval not found' });

  const { error: e2 } = await admin
    .from('writing_attempts')
    .update({
      band_overall: row.band_overall,
      band_breakdown: row.band_breakdown,
      feedback: row.feedback,
      restored_from_reeval: row.id
    })
    .eq('id', row.attempt_id);

  if (e2) return res.status(500).json({ error: e2.message });

  res.status(200).json({
    ok: true,
    attemptId: row.attempt_id,
    band_overall: row.band_overall,
    band_breakdown: row.band_breakdown,
    feedback: row.feedback
  });
}
