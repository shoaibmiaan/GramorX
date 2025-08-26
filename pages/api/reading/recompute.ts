import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/reading/supabaseAdapters';

/**
 * Recompute result server-side.
 * Accepts: { slug: string, answers: Record<string, any> }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug, answers } = req.body || {};
    if (!slug || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Fetch each question's id, correct answer, and type from Supabase
    const { data: rows, error } = await supabaseServer
      .from('reading_questions')
      .select('id, correct, type')
      .eq('test_slug', slug);

    if (error) {
      return res.status(500).json({ error: 'Failed to load questions' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Questions not found' });
    }

    const correctAnswers: Record<string, any> = {};
    const byIdType: Record<string, string> = {};
    for (const q of rows) {
      if (!q?.id || typeof q.correct === 'undefined' || !q.type) {
        return res.status(500).json({ error: `Invalid question data for ${q?.id}` });
      }
      correctAnswers[q.id] = q.correct;
      byIdType[q.id] = q.type;
    }

    const answerIds = Object.keys(answers);
    const questionIds = Object.keys(correctAnswers);
    const missingInDb = answerIds.filter(id => !correctAnswers[id]);
    const missingInAnswers = questionIds.filter(id => !(id in answers));
    if (missingInDb.length || missingInAnswers.length) {
      return res.status(400).json({ error: 'Question mismatch' });
    }

    const ids = questionIds;
    let correct = 0;
    const byType: Record<string, { total: number; correct: number }> = {};

    const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    for (const id of ids) {
      const t = (byIdType[id] as string) || 'short';
      byType[t] = byType[t] || { total: 0, correct: 0 };
      byType[t].total += 1;
      if (isEqual(answers[id], correctAnswers[id])) {
        correct += 1;
        byType[t].correct += 1;
      }
    }

    const result = {
      slug,
      total: ids.length,
      correct,
      byType,
      answers,
      correctAnswers,
    };

    return res.status(200).json({ ok: true, result });
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
