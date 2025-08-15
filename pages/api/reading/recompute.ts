import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Recompute result server-side.
 * Accepts: { slug: string, answers: Record<string, any> }
 * TODO: Replace stubbed correctAnswers & per-type mapping with DB-driven values.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { slug, answers } = req.body || {};
    if (!slug || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // TODO: Fetch correct answers from DB by slug
    // Stubbed canonical answers (match demo question ids):
    const correctAnswers: Record<string, any> = {
      q1: 'False',
      q2: 'Skimming/Scanning',
      q3: { 0: 'Definitions', 1: 'Skimming/Scanning' },
      q4: 'Scanning',
    };

    // Map id -> type (stub; in real life, derive from DB question records)
    const byIdType: Record<string, 'tfng' | 'mcq' | 'matching' | 'short'> = {
      q1: 'tfng',
      q2: 'mcq',
      q3: 'matching',
      q4: 'short',
    };

    const ids = Object.keys({ ...answers, ...correctAnswers });
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
