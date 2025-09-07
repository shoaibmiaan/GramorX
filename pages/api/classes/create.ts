// pages/api/classes/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(2000).optional(),
  startUtc: z.string().datetime(), // ISO
  endUtc: z.string().datetime(),   // ISO
  meetingUrl: z.string().url().optional(), // Zoom/Meet etc.
  maxSeats: z.number().int().min(1).max(1000).optional(),
});

type CreateClassResponse =
  | { ok: true; classId: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'DB_ERROR' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateClassResponse>
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

  // Only coaches/teachers can create classes
  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!coach) {
    return res.status(403).json({ ok: false, error: 'Only teachers can create classes', code: 'FORBIDDEN' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  }
  const { title, description, startUtc, endUtc, meetingUrl, maxSeats } = parsed.data;

  // Generate short join code (6 upper-case chars)
  const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const { data: created, error } = await supabase
    .from('classes')
    .insert({
      teacher_id: coach.id,
      title,
      description: description ?? null,
      start_utc: startUtc,
      end_utc: endUtc,
      meeting_url: meetingUrl ?? null,
      join_code: joinCode,
      join_code_expires_utc: endUtc, // expires with class by default
      max_seats: maxSeats ?? null,
      status: 'scheduled',
    })
    .select('id')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });
  }

  return res.status(200).json({ ok: true, classId: created!.id as string });
}
