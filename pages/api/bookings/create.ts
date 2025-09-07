// pages/api/bookings/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  coachId: z.string().uuid(),
  startUtc: z.string().datetime(),
  endUtc: z.string().datetime(),
  note: z.string().max(600).optional(),
});

type CreateBookingResponse =
  | { ok: true; bookingId: string; status: 'pending' | 'confirmed' }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'CONFLICT' | 'DB_ERROR' | 'BAD_REQUEST' };

function intervalsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return !(aEnd <= bStart || bEnd <= aStart);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateBookingResponse>
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
  const { coachId, startUtc, endUtc, note } = parsed.data;

  // 1) Verify the requested window is inside coach availability
  const { data: avail, error: aErr } = await supabase
    .from('coach_availability')
    .select('start_utc, end_utc')
    .eq('coach_id', coachId)
    .lte('start_utc', startUtc)
    .gte('end_utc', endUtc)
    .maybeSingle();

  if (aErr) {
    return res.status(500).json({ ok: false, error: aErr.message, code: 'DB_ERROR' });
  }
  if (!avail) {
    return res.status(409).json({ ok: false, error: 'Requested time not available', code: 'CONFLICT' });
  }

  // 2) Conflict check against existing bookings
  const { data: existing, error: eErr } = await supabase
    .from('bookings')
    .select('start_utc, end_utc, status')
    .eq('coach_id', coachId)
    .neq('status', 'canceled')
    .gte('end_utc', avail.start_utc)
    .lte('start_utc', avail.end_utc);

  if (eErr) {
    return res.status(500).json({ ok: false, error: eErr.message, code: 'DB_ERROR' });
  }

  const conflict = (existing ?? []).some((b) =>
    intervalsOverlap(startUtc, endUtc, b.start_utc, b.end_utc)
  );
  if (conflict) {
    return res.status(409).json({ ok: false, error: 'Slot already booked', code: 'CONFLICT' });
  }

  // 3) Create booking (pending by default; allow coach to confirm in their console)
  const { data: created, error: cErr } = await supabase
    .from('bookings')
    .insert({
      coach_id: coachId,
      user_id: user.id,
      start_utc: startUtc,
      end_utc: endUtc,
      status: 'pending',
      note: note ?? null,
    })
    .select('id, status')
    .single();

  if (cErr) {
    return res.status(500).json({ ok: false, error: cErr.message, code: 'DB_ERROR' });
  }

  return res.status(200).json({ ok: true, bookingId: created!.id, status: created!.status });
}
