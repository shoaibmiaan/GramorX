// pages/api/ai/writing/score-v2.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
// import { scoreWritingV2 } from '@/lib/ai/writing_v2';

const BodySchema = z.object({
  attemptId: z.string().uuid().optional(),
  taskType: z.enum(['task1', 'task2']),
  promptId: z.string().uuid().optional(),
  text: z.string().trim().min(80).max(8000),
  words: z.number().int().min(50).max(2000).optional(),
  targetBand: z.number().min(4).max(9).optional(),
  locale: z.enum(['en']).default('en'),
});

type WritingScore = {
  overall: number;
  breakdown: { taskResponse: number; coherence: number; lexical: number; grammar: number };
  suggestions: string[];
  wordCount: number;
};

type WritingResponse =
  | { ok: true; attemptId?: string; score: WritingScore }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'BAD_REQUEST' | 'NOT_FOUND' | 'DB_ERROR' };

function heuristic(text: string, wordsHint?: number): WritingScore {
  const wordCount = wordsHint ?? text.trim().split(/\s+/).length;
  const longSentences = (text.match(/[,;:—-]/g) ?? []).length;
  const paragraphs = (text.split(/\n{2,}/).length);
  const base = 6 + (paragraphs >= 3 ? 0.5 : 0) + (longSentences > 8 ? 0.5 : 0) + (wordCount > 260 ? 0.5 : 0);
  const clamp = (n: number) => Math.max(4.5, Math.min(8.5, Math.round(n * 2) / 2));
  const overall = clamp(base);
  return {
    overall,
    breakdown: {
      taskResponse: clamp(base - 0.5),
      coherence: clamp(base),
      lexical: clamp(base - 0.5),
      grammar: clamp(base - 0.5),
    },
    suggestions: [
      'Strengthen overview and clear position in introduction.',
      'Use topic sentences and linking devices (Furthermore, Consequently).',
      'Vary sentence structures and reduce repetition.',
      'Check articles and subject–verb agreement.',
    ],
    wordCount,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WritingResponse>
) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { attemptId, text, words } = parsed.data;

  // Verify ownership if attempt supplied
  if (attemptId) {
    const { data } = await supabase.from('attempts_writing').select('user_id').eq('id', attemptId).maybeSingle();
    if (!data || data.user_id !== auth.user.id) {
      return res.status(404).json({ ok: false, error: 'Attempt not found', code: 'NOT_FOUND' });
    }
  }

  // const score = await scoreWritingV2(parsed.data);
  const score = heuristic(text, words);

  if (attemptId) {
    await supabase.from('attempts_writing').update({ score_json: score, ai_feedback_json: { v: 2, score } }).eq('id', attemptId);
  }

  return res.status(200).json({ ok: true, attemptId: attemptId ?? undefined, score });
}
