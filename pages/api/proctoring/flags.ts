// pages/api/proctoring/flags.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  events: z.array(
    z.object({
      type: z.enum([
        'face_off', 'multiple_faces', 'tab_switch', 'noise',
        'mic_mute', 'cam_off', 'suspicious_motion', 'identity_mismatch',
      ]),
      atUtc: z.string().datetime(),               // ISO timestamp
      score: z.number().min(0).max(1).default(0), // confidence 0..1
      evidenceUrl: z.string().url().optional(),
      notes: z.string().max(1000).optional(),
      meta: z.record(z.any()).optional(),
    })
  ).min(1).max(200),
});

type FlagsResponse =
  | { ok: true; sessionId: string; inserted: number }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FlagsResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { sessionId, events } = parsed.data;

  // Ensure session belongs to user (or relax if invigilator later)
  const { data: session, error: sErr } = await supabase
    .from('proctoring_sessions')
    .select('id, user_id, status')
    .eq('id', sessionId)
    .maybeSingle();

  if (sErr) return res.status(500).json({ ok: false, error: sErr.message, code: 'DB_ERROR' });
  if (!session) return res.status(404).json({ ok: false, error: 'Session not found', code: 'NOT_FOUND' });
  if (session.user_id !== user.id) return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });

  const rows = events.map(e => ({
    session_id: sessionId,
    type: e.type,
    at_utc: e.atUtc,
    confidence: e.score,
    evidence_url: e.evidenceUrl ?? null,
    notes: e.notes ?? null,
    meta_json: e.meta ?? null,
  }));

  const { error: iErr } = await supabase.from('proctoring_flags').insert(rows);
  if (iErr) return res.status(500).json({ ok: false, error: iErr.message, code: 'DB_ERROR' });

  // Also mirror into proctoring_events for a unified timeline
  await supabase.from('proctoring_events').insert(
    events.map(e => ({
      session_id: sessionId,
      type: `flag_${e.type}`,
      at_utc: e.atUtc,
      meta_json: { score: e.score, evidenceUrl: e.evidenceUrl, notes: e.notes, ...e.meta },
    }))
  );

  return res.status(200).json({ ok: true, sessionId, inserted: events.length });
}
