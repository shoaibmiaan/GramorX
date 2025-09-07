// pages/api/classes/cancel.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  classId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

type CancelClassResponse =
  | { ok: true; classId: string; status: 'canceled' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED'|'FORBIDDEN'|'NOT_FOUND'|'DB_ERROR'|'BAD_REQUEST' };

export default async function handler(req: NextApiRequest, res: NextApiResponse<CancelClassResponse>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { classId, reason } = parsed.data;

  // Load class
  const { data: klass, error: kErr } = await supabase
    .from('classes')
    .select('id, teacher_id, status')
    .eq('id', classId)
    .maybeSingle();

  if (kErr) return res.status(500).json({ ok: false, error: kErr.message, code: 'DB_ERROR' });
  if (!klass) return res.status(404).json({ ok: false, error: 'Class not found', code: 'NOT_FOUND' });

  // Authorize teacher
  const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', user.id).maybeSingle();
  if (!coach || coach.id !== klass.teacher_id) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  // Update status
  const { error: uErr } = await supabase
    .from('classes')
    .update({ status: 'canceled', cancel_reason: reason ?? null })
    .eq('id', classId);

  if (uErr) return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });

  // Notify members (best-effort)
  await supabase.from('class_notifications').insert({ class_id: classId, type: 'class_canceled', payload_json: { reason } }).catch(() => {});

  return res.status(200).json({ ok: true, classId, status: 'canceled' });
}
