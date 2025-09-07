// pages/api/classes/join-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  classId: z.string().uuid(),
  rotate: z.boolean().default(false),               // if true: rotate join_code
  extendHours: z.number().int().min(1).max(720).optional(), // extend expiry
});

type JoinTokenResponse =
  | { ok: true; classId: string; joinCode: string; expiresUtc: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR' | 'BAD_REQUEST' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JoinTokenResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  }
  const { classId, rotate, extendHours } = parsed.data;

  // Load class and authorize teacher
  const { data: klass, error: kErr } = await supabase
    .from('classes')
    .select('id, teacher_id, join_code, join_code_expires_utc')
    .eq('id', classId)
    .maybeSingle();
  if (kErr) return res.status(500).json({ ok: false, error: kErr.message, code: 'DB_ERROR' });
  if (!klass) return res.status(404).json({ ok: false, error: 'Class not found', code: 'NOT_FOUND' });

  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!coach || coach.id !== klass.teacher_id) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  let newCode = klass.join_code;
  let newExpiry = klass.join_code_expires_utc as string;

  if (rotate) {
    newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  if (extendHours) {
    const base = new Date(klass.join_code_expires_utc ?? new Date().toISOString());
    base.setHours(base.getHours() + extendHours);
    newExpiry = new Date(base.getTime() - base.getTimezoneOffset() * 60000).toISOString();
  }

  const { error: uErr, data: updated } = await supabase
    .from('classes')
    .update({ join_code: newCode, join_code_expires_utc: newExpiry })
    .eq('id', classId)
    .select('join_code, join_code_expires_utc')
    .single();

  if (uErr) {
    return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });
  }

  return res.status(200).json({
    ok: true,
    classId,
    joinCode: updated!.join_code as string,
    expiresUtc: updated!.join_code_expires_utc as string,
  });
}
