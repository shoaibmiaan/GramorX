// pages/api/classes/attendance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  classId: z.string().uuid(),
  action: z.enum(['join', 'leave']),
  joinCode: z.string().trim().length(6).optional(), // required for join if not already a member
  sessionUtc: z.string().datetime().optional(),     // optional session bucket (ISO date/time)
  device: z.object({
    ua: z.string().max(512).optional(),
    platform: z.string().max(64).optional(),
  }).optional(),
});

type AttendanceResponse =
  | { ok: true; classId: string; action: 'join' | 'leave' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'EXPIRED' | 'DB_ERROR' | 'BAD_REQUEST' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AttendanceResponse>
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
  const { classId, action, joinCode, sessionUtc, device } = parsed.data;

  // Get class info
  const { data: klass, error: kErr } = await supabase
    .from('classes')
    .select('id, join_code, join_code_expires_utc, start_utc, end_utc, max_seats, status')
    .eq('id', classId)
    .maybeSingle();
  if (kErr) return res.status(500).json({ ok: false, error: kErr.message, code: 'DB_ERROR' });
  if (!klass) return res.status(404).json({ ok: false, error: 'Class not found', code: 'NOT_FOUND' });

  // If joining and not a member, validate join code + expiry + seat limits
  if (action === 'join') {
    // Is user already a member?
    const { data: member } = await supabase
      .from('class_members')
      .select('class_id, user_id')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      if (!joinCode || joinCode !== klass.join_code) {
        return res.status(403).json({ ok: false, error: 'Invalid join code', code: 'FORBIDDEN' });
      }
      if (klass.join_code_expires_utc && new Date(klass.join_code_expires_utc) < new Date()) {
        return res.status(410).json({ ok: false, error: 'Join code expired', code: 'EXPIRED' });
      }

      // Seat count check (if max_seats set)
      if (klass.max_seats) {
        const { data: current } = await supabase
          .from('class_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('class_id', classId);
        const count = (current as unknown as { count: number } | null)?.count ?? 0;
        if (count >= klass.max_seats) {
          return res.status(403).json({ ok: false, error: 'Class is full', code: 'FORBIDDEN' });
        }
      }

      // Insert membership
      const { error: mErr } = await supabase
        .from('class_members')
        .insert({ class_id: classId, user_id: user.id, role: 'student' });
      if (mErr) {
        return res.status(500).json({ ok: false, error: mErr.message, code: 'DB_ERROR' });
      }
    }

    // Mark attendance (join)
    const { error: aErr } = await supabase
      .from('class_attendance')
      .insert({
        class_id: classId,
        user_id: user.id,
        session_utc: sessionUtc ?? new Date().toISOString(),
        joined_at_utc: new Date().toISOString(),
        device_json: device ?? null,
      });
    if (aErr) {
      return res.status(500).json({ ok: false, error: aErr.message, code: 'DB_ERROR' });
    }

    return res.status(200).json({ ok: true, classId, action: 'join' });
  }

  // action === 'leave' → close the latest open attendance row for this user
  const { data: latest, error: lErr } = await supabase
    .from('class_attendance')
    .select('id, joined_at_utc, left_at_utc')
    .eq('class_id', classId)
    .eq('user_id', user.id)
    .is('left_at_utc', null)
    .order('joined_at_utc', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lErr) return res.status(500).json({ ok: false, error: lErr.message, code: 'DB_ERROR' });
  if (!latest) return res.status(404).json({ ok: false, error: 'No active attendance found', code: 'NOT_FOUND' });

  const { error: uErr } = await supabase
    .from('class_attendance')
    .update({ left_at_utc: new Date().toISOString() })
    .eq('id', latest.id);

  if (uErr) return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, classId, action: 'leave' });
}
