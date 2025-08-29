// pages/api/speaking/attempts/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SectionSchema = z.enum(['part1', 'part2', 'part3']);
const ScoreSchema = z.object({
  fluency: z.number().min(0).max(9).optional(),
  lexical: z.number().min(0).max(9).optional(),
  grammar: z.number().min(0).max(9).optional(),
  pronunciation: z.number().min(0).max(9).optional(),
  overall: z.number().min(0).max(9).optional(),
  feedback: z.string().max(1200).optional(),
});
const CreateSchema = z.object({
  section: z.union([SectionSchema, z.string()]),
  fileUrl: z.string().url(),
  transcript: z.string().optional(),
  durationSec: z.number().int().min(1).max(900).optional(),
  scores: ScoreSchema.optional(),
  topic: z.string().optional(),
  points: z.array(z.string()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth via Supabase cookie
  const userClient = createSupabaseServerClient({ req });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    const parsed = CreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad request', issues: parsed.error.issues });

    const body = parsed.data;

    // normalize section
    const norm = String(body.section).toLowerCase().replace(/\s+/g, '');
    const section =
      norm === 'p1' || norm === '1' ? 'part1' :
      norm === 'p2' || norm === '2' ? 'part2' :
      norm === 'p3' || norm === '3' ? 'part3' :
      (['part1','part2','part3'].includes(norm) ? (norm as 'part1'|'part2'|'part3') : 'part2');

    const payload: any = {
      user_id: user.id,
      section,
      file_url: body.fileUrl,
      transcript: body.transcript ?? null,
      duration_sec: body.durationSec ?? null,
      topic: body.topic ?? null,
      points: body.points ?? null,
      created_by: user.email ?? null,
    };
    if (body.scores) {
      payload.fluency = body.scores.fluency ?? null;
      payload.lexical = body.scores.lexical ?? null;
      payload.grammar = body.scores.grammar ?? null;
      payload.pronunciation = body.scores.pronunciation ?? null;
      payload.overall = body.scores.overall ?? null;
      payload.feedback = body.scores.feedback ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from('speaking_attempts')
      .insert(payload)
      .select('id, section, overall')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({
      ok: true,
      attemptId: data?.id,
      section: data?.section,
      overall: data?.overall ?? null,
    });
  }

  if (req.method === 'GET') {
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);
    const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0;

    const query = supabaseAdmin
      .from('speaking_attempts')
      .select('id, section, overall, created_at, duration_sec', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + (limit - 1));

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({
      ok: true,
      total: count ?? 0,
      items: data ?? [],
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
