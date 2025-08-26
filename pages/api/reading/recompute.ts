import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseService as supabase } from '@/lib/supabaseService'; // server key client

// POST body schema
const Body = z.object({
  slug: z.string().min(1),
  // answers: { [questionId: string]: string | string[] }
  answers: z.record(z.union([z.string(), z.array(z.string())])),
});

type AnswerValue = string | string[];

function norm(val: AnswerValue): string {
  if (Array.isArray(val)) return val.map(v => v.trim().toLowerCase()).sort().join('|');
  return val.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }
  const { slug, answers } = parsed.data;

  // TODO: Adjust table/columns to your schema if different.
  // Expect a table with: id, slug, correct_answer, type
  const { data: questions, error } = await supabase
    .from('reading_questions')
    .select('id, slug, correct_answer, type')
    .eq('slug', slug);

  if (error) return res.status(500).json({ error: 'DB query failed', detail: error.message });
  if (!questions || questions.length === 0) return res.status(404).json({ error: 'No questions for slug' });

  const resultDetails = questions.map(q => {
    const qid = String(q.id);
    const userAns = answers[qid];
    const correct = q.correct_answer as unknown as AnswerValue;
    const isCorrect = userAns != null && norm(userAns) === norm(correct);
    return {
      id: qid,
      type: q.type ?? null,
      userAnswer: userAns ?? null,
      correctAnswer: correct ?? null,
      isCorrect,
    };
  });

  const total = resultDetails.length;
  const correctCount = resultDetails.filter(d => d.isCorrect).length;
  const wrong = total - correctCount;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return res.status(200).json({
    slug,
    total,
    correct: correctCount,
    wrong,
    score,
    details: resultDetails,
  });