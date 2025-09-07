// pages/api/bookings/cancel.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
});

type CancelResponse =
  | { ok: true; bookingId: string; status: 'canceled' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOO_LATE' | 'DB_ERROR' | 'BAD_REQUEST' };

const MIN_HOURS_BEFORE = 12; // cannot cancel within 12h of start (adjust if needed)

function hoursUntil(startIso: string) {
  const now = new Date().getTime();
  const start = new Date(startIso).getTime();
  return (start - now) / (1000 * 60 * 60);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CancelResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabase = supabaseServer(req, res);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  }
  const { bookingId, reason } = parsed.data;

  // 1) Fetch booking to authorize and time-check
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('id, user_id, coach_id, start_utc, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (bErr) {
    return res.status(500).json({ ok: false, error: bErr.message, code: 'DB_ERROR' });
  }
  if (!booking) {
    return res.status(404).json({ ok: false, error: 'Booking not found' });
  }

  // 2) Authorization: student owner or the coach can cancel
  const isOwner = booking.user_id === user.id;

  // Check if requester is the coach (by matching a coach row with user_id)
  const { data: coachRow } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const isCoach = !!coachRow && booking.coach_id === coachRow.id;

  if (!isOwner && !isCoach) {
    return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }

  // 3) Time guard
  if (hoursUntil(booking.start_utc) < MIN_HOURS_BEFORE) {
    return res.status(409).json({ ok: false, error: 'Too close to start time', code: 'TOO_LATE' });
  }

  // 4) Update status
  const { error: uErr } = await supabase
    .from('bookings')
    .update({ status: 'canceled', cancel_reason: reason ?? null })
    .eq('id', bookingId);

  if (uErr) {
    return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });
  }

  return res.status(200).json({ ok: true, bookingId, status: 'canceled' });
}
