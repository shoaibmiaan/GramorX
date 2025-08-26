import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseService as supabase } from '@/lib/supabaseService';

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

    // Fetch questions for this slug to build canonical answers and type mapping
    const { data: questions, error } = await supabase
      .from('reading_questions')
      .select('id, correct, type')
      .eq('test_slug', slug);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'Questions not found for slug' });
    }

    const correctAnswers: Record<string, any> = {};
    const byIdType: Record<string, string> = {};

    for (const q of questions) {
      if (!q.id || typeof q.correct === 'undefined' || !q.type) {
        return res.status(500).json({ error: 'Incomplete question data' });
      }
      correctAnswers[q.id] = q.correct;
      byIdType[q.id] = q.type;
    }

    // Ensure provided answers correspond to known questions
    for (const id of Object.keys(answers)) {
      if (!(id in correctAnswers)) {
        return res.status(400).json({ error: `Unknown question id: ${id}` });
      }
    }

    const ids = questions.map((q: any) => q.id);
    let correct = 0;
    const byType: Record<string, { total: number; correct: number }> = {};

    const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

    for (const id of ids) {
      const t = byIdType[id] || 'short';
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
