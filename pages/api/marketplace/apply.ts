// pages/api/marketplace/apply.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const BodySchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  headline: z.string().trim().min(6).max(120),
  bio: z.string().trim().min(30).max(2000),
  pricePerHour: z.number().min(1).max(100000),
  languages: z.array(z.string().trim().max(8)).min(1).max(8),
  tags: z.array(z.string().trim().max(24)).max(20).optional(),
  introVideoUrl: z.string().url().optional(),
});

type ApplyResponse =
  | { ok: true; coachId: string }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'BAD_REQUEST' | 'DB_ERROR' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApplyResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const supabase = supabaseServer(req, res);
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();

  if (uErr || !user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });
  }

  const payload = parsed.data;

  // Upsert to coaches (status under review by default)
  const { data, error } = await supabase
    .from('coaches')
    .upsert(
      {
        user_id: user.id,
        display_name: payload.displayName,
        headline: payload.headline,
        bio: payload.bio,
        price_per_hour: payload.pricePerHour,
        languages: payload.languages,
        tags: payload.tags ?? [],
        intro_video_url: payload.introVideoUrl ?? null,
        rating_avg: 0,
        rating_count: 0,
        is_active: false,
        status: 'under_review',
      },
      { onConflict: 'user_id' }
    )
    .select('id')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });
  }

  return res.status(200).json({ ok: true, coachId: data!.id as string });
}
