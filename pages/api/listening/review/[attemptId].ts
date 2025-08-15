import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const attemptId = String(req.query.attemptId);

  const [{ data: attempt, error: e1 }, { data: answers, error: e2 }] = await Promise.all([
    supabaseAdmin.from('listening_attempts').select('*').eq('id', attemptId).single(),
    supabaseAdmin.from('listening_user_answers').select('qno,answer,is_correct').eq('attempt_id', attemptId).order('qno')
  ]);

  if (e1 || !attempt) return res.status(404).json({ error: e1?.message || 'Attempt not found' });

  // For review UI we also include questions + keys
  const { data: questions, error: e3 } = await supabaseAdmin
    .from('listening_questions')
    .select('qno,type,prompt,options,match_left,match_right,answer_key')
    .eq('test_slug', attempt.test_slug)
    .order('qno');

  if (e2 || e3) return res.status(500).json({ error: e2?.message || e3?.message });

  res.json({
    attempt: {
      id: attempt.id,
      test_slug: attempt.test_slug,
      score: attempt.score,
      band: attempt.band,
      section_scores: attempt.section_scores,
      submitted_at: attempt.submitted_at,
      meta: attempt.meta,
    },
    answers: answers ?? [],
    questions: questions ?? [],
  });
}
