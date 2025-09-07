// pages/api/marketplace/approve.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  coachId: z.string().uuid(),
  action: z.enum(['approve','reject']),
  note: z.string().max(500).optional(),
});

type ApproveResponse =
  | { ok: true; coachId: string; status: 'active'|'rejected' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED'|'FORBIDDEN'|'NOT_FOUND'|'BAD_REQUEST'|'DB_ERROR' };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApproveResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  // Require platform admin (profiles.role)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!profile || (profile as any).role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { coachId, action, note } = parsed.data;

  const { data: coach } = await supabase.from('coaches').select('id,status').eq('id', coachId).maybeSingle();
  if (!coach) return res.status(404).json({ ok: false, error: 'Coach not found', code: 'NOT_FOUND' });

  const status = action === 'approve' ? 'active' : 'rejected';
  const is_active = action === 'approve';

  const { error } = await supabase
    .from('coaches')
    .update({ status, is_active, review_note: note ?? null, reviewed_by: user.id, reviewed_at_utc: new Date().toISOString() })
    .eq('id', coachId);

  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, coachId, status: status as 'active'|'rejected' });
}
