// pages/api/proctoring/start.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  examAttemptId: z.string().uuid(),
  device: z.object({
    ua: z.string().max(512).optional(),
    platform: z.string().max(64).optional(),
    camera: z.boolean().optional(),
    microphone: z.boolean().optional(),
    screen: z.boolean().optional(),
  }).optional(),
});

type StartResponse =
  | { ok: true; sessionId: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'DB_ERROR' | 'BAD_REQUEST' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StartResponse>
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
  const { examAttemptId, device } = parsed.data;

  // Ensure attempt exists and belongs to the user
  const { data: attempt, error: aErr } = await supabase
    .from('attempts_listening') // NOTE: We support any module; try each table or use a unified attempts table if present.
    .select('id, user_id')
    .eq('id', examAttemptId)
    .maybeSingle();

  // If not in listening, check reading/writing/speaking
  let ownerId = attempt?.user_id as string | undefined;
  if (aErr || !attempt) {
    const tryTables = ['attempts_reading', 'attempts_writing', 'attempts_speaking'] as const;
    for (const t of tryTables) {
      // eslint-disable-next-line no-await-in-loop
      const { data: att } = await supabase.from(t).select('id, user_id').eq('id', examAttemptId).maybeSingle();
      if (att) {
        ownerId = att.user_id as string;
        break;
      }
    }
  }
  if (!ownerId) {
    return res.status(404).json({ ok: false, error: 'Attempt not found', code: 'NOT_FOUND' });
  }
  if (ownerId !== user.id) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  // Create proctoring session
  const { data: created, error: sErr } = await supabase
    .from('proctoring_sessions')
    .insert({
      user_id: user.id,
      exam_attempt_id: examAttemptId,
      started_at_utc: new Date().toISOString(),
      status: 'active',
      device_info_json: device ?? null,
    })
    .select('id')
    .single();

  if (sErr) {
    return res.status(500).json({ ok: false, error: sErr.message, code: 'DB_ERROR' });
  }

  // Log initial event
  await supabase.from('proctoring_events').insert({
    session_id: created!.id,
    type: 'session_started',
    meta_json: device ?? null,
  });

  return res.status(200).json({ ok: true, sessionId: created!.id as string });
}
