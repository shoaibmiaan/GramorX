// pages/api/proctoring/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  checks: z.object({
    webcamOk: z.boolean(),
    micOk: z.boolean(),
    screenOk: z.boolean().optional(),
    faceVisible: z.boolean().optional(),
    roomClear: z.boolean().optional(),
  }),
  notes: z.string().max(1000).optional(),
});

type VerifyResponse =
  | { ok: true; sessionId: string; passed: boolean }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'DB_ERROR' | 'BAD_REQUEST' };

function decidePass(checks: { webcamOk: boolean; micOk: boolean; screenOk?: boolean; faceVisible?: boolean; roomClear?: boolean; }) {
  // Minimal policy: require webcam & mic; encourage screen share if required later
  return !!(checks.webcamOk && checks.micOk);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
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
  const { sessionId, checks, notes } = parsed.data;

  // Load session to authorize
  const { data: session, error: sErr } = await supabase
    .from('proctoring_sessions')
    .select('id, user_id, status')
    .eq('id', sessionId)
    .maybeSingle();

  if (sErr) return res.status(500).json({ ok: false, error: sErr.message, code: 'DB_ERROR' });
  if (!session) return res.status(404).json({ ok: false, error: 'Session not found', code: 'NOT_FOUND' });
  if (session.user_id !== user.id) return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  if (session.status !== 'active') {
    return res.status(400).json({ ok: false, error: 'Session not active', code: 'BAD_REQUEST' });
  }

  const passed = decidePass(checks);

  // Log verification event
  const { error: eErr } = await supabase.from('proctoring_events').insert({
    session_id: sessionId,
    type: 'precheck_verification',
    meta_json: { checks, notes, passed },
  });
  if (eErr) return res.status(500).json({ ok: false, error: eErr.message, code: 'DB_ERROR' });

  // Optionally set a precheck flag or status in session
  const { error: uErr } = await supabase
    .from('proctoring_sessions')
    .update({ precheck_passed: passed })
    .eq('id', sessionId);
  if (uErr) return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, sessionId, passed });
}
