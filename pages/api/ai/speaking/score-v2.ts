// pages/api/ai/speaking/score-v2.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
// If available, use shared scorer (preferred):
// import { scoreSpeakingV2 } from '@/lib/ai/speaking_v2';

const BodySchema = z.object({
  attemptId: z.string().uuid().optional(),
  audioUrl: z.string().url().optional(),       // URL in storage
  transcript: z.string().trim().min(10).max(10000).optional(),
  locale: z.enum(['en', 'ur']).default('en'),
});

type SpeakingScore = {
  overall: number;                              // 0–9 (0.5 steps ok)
  breakdown: { fluency: number; pronunciation: number; grammar: number; vocabulary: number };
  suggestions: string[];
  wordsPerMinute?: number;
  hesitationsPerMin?: number;
  fillerRate?: number;
};

type SpeakingResponse =
  | { ok: true; attemptId?: string; score: SpeakingScore }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'BAD_REQUEST' | 'NOT_FOUND' | 'DB_ERROR' };

function simpleHeuristic(transcript: string): SpeakingScore {
  const words = transcript.trim().split(/\s+/).length;
  // naive estimates (replace with model output when lib/ai is wired)
  const wpm = Math.min(180, Math.max(70, Math.round(words / 2))); // assume ~2 min speech
  const fillers = (transcript.match(/\b(um|uh|like|you know)\b/gi) ?? []).length;
  const fillerRate = Math.min(1, fillers / Math.max(1, words)) * 5;
  const base = 6.0 + (wpm > 120 ? 0.5 : 0) - (fillerRate > 0.1 ? 0.5 : 0);
  const clamp = (n: number) => Math.max(3.5, Math.min(8.5, Math.round(n * 2) / 2));
  return {
    overall: clamp(base),
    breakdown: {
      fluency: clamp(base + (wpm > 110 ? 0.5 : 0) - (fillerRate > 0.12 ? 0.5 : 0)),
      pronunciation: clamp(base),
      grammar: clamp(base - 0.5),
      vocabulary: clamp(base - 0.5),
    },
    suggestions: [
      'Reduce fillers by pausing briefly before ideas.',
      'Aim for steady pace ~110–140 WPM.',
      'Use discourse markers (however, moreover, consequently).',
    ],
    wordsPerMinute: wpm,
    hesitationsPerMin: Math.round(fillers / 2),
    fillerRate,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SpeakingResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { attemptId, audioUrl, transcript } = parsed.data;

  // If attempt is provided, verify ownership
  if (attemptId) {
    const tables = ['attempts_speaking', 'attempts_listening', 'attempts_reading', 'attempts_writing'] as const;
    let owner = null as string | null;
    for (const t of tables) {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await supabase.from(t).select('user_id').eq('id', attemptId).maybeSingle();
      if (data) { owner = data.user_id; break; }
    }
    if (owner !== auth.user.id) return res.status(404).json({ ok: false, error: 'Attempt not found', code: 'NOT_FOUND' });
  }

  // TODO: use real scorer once wired
  // const score = await scoreSpeakingV2({ audioUrl, transcript, locale });
  const score = transcript ? simpleHeuristic(transcript) : simpleHeuristic('sample fallback transcript like this one with enough words to score.');

  // Persist score (optional)
  if (attemptId) {
    await supabase
      .from('attempts_speaking')
      .update({ score_json: score })
      .eq('id', attemptId);
  }

  return res.status(200).json({ ok: true, attemptId: attemptId ?? undefined, score });
}
