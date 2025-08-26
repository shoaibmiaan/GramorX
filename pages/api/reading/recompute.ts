import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseService as supabase } from '@/lib/supabaseService';

const Body = z.object({
  slug: z.string().min(1),
  // answers: { [questionId: string]: string | string[] }
  answers: z.record(z.union([z.string(), z.array(z.string())])),
});

type AnswerValue = string | string[];

function normalize(val: AnswerValue | null | undefined): string | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val.map(v => v.trim().toLowerCase()).sort().join('|');
  return val.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const { slug, answers } = parsed.data;

  try {
    // Adjust table/columns if your schema differs
    const { data: questions, error } = await supabase
      .from('reading_questions')
      .select('id, slug, correct_answer, type')
      .eq('slug', slug);

    if (error) {
      return res.status(500).json({ error: 'DB query failed', detail: error.message });
    }
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'No questions for slug' });
    }

    const details = questions.map((q: any) => {
      const qid = String(q.id);
      const userAns = answers[qid] as AnswerValue | undefined;
      const correct = q.correct_answer as unknown as AnswerValue | null;
      const isCorrect = normalize(userAns) === normalize(correct);
      return {
        id: qid,
        type: q.type ?? null,
        userAnswer: userAns ?? null,
        correctAnswer: correct ?? null,
        isCorrect,
      };
    });

    const total = details.length;
    const correctCount = details.filter(d => d.isCorrect).length;

    return res.status(200).json({
      slug,
      total,
      correct: correctCount,
      wrong: total - correctCount,
      score: total > 0 ? Math.round((correctCount / total) * 100) : 0,
      details,
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Unhandled server error', detail: e?.message ?? String(e) });
  }
}
