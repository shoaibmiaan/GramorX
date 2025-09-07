// pages/api/ai/reading/explanations.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
// import { explainReadingAnswers } from '@/lib/ai/reading_v2';

const BodySchema = z.object({
  paperId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()).min(1).max(60),
  userAnswers: z.record(z.string().uuid(), z.string().trim().max(200)),
  locale: z.enum(['en']).default('en'),
});

type Explanation = {
  questionId: string;
  correctAnswer: string;
  isCorrect: boolean;
  why: string;
  tip: string;
};

type ReadingExplainResponse =
  | { ok: true; paperId: string; explanations: Explanation[] }
  | { ok: false; error: string; code?: 'UNAUTHORIZED' | 'BAD_REQUEST' | 'NOT_FOUND' | 'DB_ERROR' };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadingExplainResponse>
) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const supabase = supabaseServer(req, res);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return res.status(401).json({ ok: false, error: 'Unauthorized', code: 'UNAUTHORIZED' });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.message, code: 'BAD_REQUEST' });

  const { paperId, questionIds, userAnswers } = parsed.data;

  // Pull correct answers (assumes table reading_questions with (id, paper_id, answer, rationale))
  const { data: qs, error } = await supabase
    .from('reading_questions')
    .select('id, answer, rationale')
    .eq('paper_id', paperId)
    .in('id', questionIds);

  if (error) return res.status(500).json({ ok: false, error: error.message, code: 'DB_ERROR' });
  if (!qs || qs.length === 0) return res.status(404).json({ ok: false, error: 'Questions not found', code: 'NOT_FOUND' });

  // const explanations = await explainReadingAnswers({ paperId, qs, userAnswers });
  const explanations = qs.map((q) => {
    const ua = userAnswers[q.id] ?? '';
    const isCorrect = ua.toLowerCase().trim() === String(q.answer).toLowerCase().trim();
    return {
      questionId: q.id,
      correctAnswer: String(q.answer),
      isCorrect,
      why: q.rationale ?? (isCorrect ? 'Your answer matches the key details in the passage.' : 'Focus on matching keywords and scanning for paraphrases.'),
      tip: isCorrect ? 'Great—keep verifying with line references.' : 'Underline synonyms in the question and passage to avoid traps.',
    } as Explanation;
  });

  return res.status(200).json({ ok: true, paperId, explanations });
}
