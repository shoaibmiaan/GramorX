// pages/api/bookings/reschedule.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  newStartUtc: z.string().datetime(),
  newEndUtc: z.string().datetime(),
});

type RescheduleResponse =
  | { ok: true; bookingId: string; status: 'pending' | 'confirmed' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'DB_ERROR' | 'BAD_REQUEST' };

function overlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return !(aEnd <= bStart || bEnd <= aStart);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RescheduleResponse>
) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  const { bookingId, newStartUtc, newEndUtc } = parsed.data;

  // Load booking
  const { data: b, error: bErr } = await supabase
    .from('bookings')
    .select('id, user_id, coach_id, status, start_utc, end_utc')
    .eq('id', bookingId)
    .maybeSingle();

  if (bErr) return res.status(500).json({ ok: false, error: bErr.message, code: 'DB_ERROR' });
  if (!b) return res.status(404).json({ ok: false, error: 'Booking not found', code: 'NOT_FOUND' });

  // Owner (student) or coach can reschedule
  const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', user.id).maybeSingle();
  const isOwner = b.user_id === user.id;
  const isCoach = !!coach && coach.id === b.coach_id;
  if (!isOwner && !isCoach) return res.status(403).json({ ok: false, error: 'Forbidden', code: 'FORBIDDEN' });

  // Ensure new slot lies within any availability window
  const { data: avail } = await supabase
    .from('coach_availability')
    .select('start_utc, end_utc')
    .eq('coach_id', b.coach_id)
    .lte('start_utc', newStartUtc)
    .gte('end_utc', newEndUtc)
    .maybeSingle();

  if (!avail) return res.status(409).json({ ok: false, error: 'Requested time not available', code: 'CONFLICT' });

  // Conflict against other bookings
  const { data: existing, error: eErr } = await supabase
    .from('bookings')
    .select('start_utc, end_utc, status, id')
    .eq('coach_id', b.coach_id)
    .neq('status', 'canceled')
    .neq('id', bookingId)
    .gte('end_utc', avail.start_utc)
    .lte('start_utc', avail.end_utc);

  if (eErr) return res.status(500).json({ ok: false, error: eErr.message, code: 'DB_ERROR' });

  const conflict = (existing ?? []).some(x => overlap(newStartUtc, newEndUtc, x.start_utc, x.end_utc));
  if (conflict) return res.status(409).json({ ok: false, error: 'Slot already booked', code: 'CONFLICT' });

  const { data: updated, error: uErr } = await supabase
    .from('bookings')
    .update({ start_utc: newStartUtc, end_utc: newEndUtc, status: 'pending' })
    .eq('id', bookingId)
    .select('status')
    .single();

  if (uErr) return res.status(500).json({ ok: false, error: uErr.message, code: 'DB_ERROR' });

  return res.status(200).json({ ok: true, bookingId, status: updated!.status });
}
