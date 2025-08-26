import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rawToBand } from '@/lib/listening/band';
import { scoreAll } from '@/lib/listening/score';

type Body = { test_slug: string; answers: { qno:number; answer:any }[]; meta?: any };

async function getUserId(req: NextApiRequest, res: NextApiResponse) {
  // Parse and verify the Supabase auth session from cookies
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthenticated');
  return user.id;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  let userId: string;
  try {
    userId = await getUserId(req, res);
  } catch {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const { test_slug, answers, meta }: Body = req.body || {};
  if (!test_slug || !Array.isArray(answers)) return res.status(400).json({ error: 'Invalid payload' });

  // Pull questions for deterministic scoring on server
  const { data: questions, error: qErr } = await supabaseAdmin
    .from('listening_questions')
    .select('qno,type,answer_key')
    .eq('test_slug', test_slug)
    .order('qno');

  if (qErr) return res.status(500).json({ error: qErr.message });

  // Score
  const { total, perSection } = scoreAll(
    (questions ?? []).map(q => ({ qno:q.qno, type:q.type as any, answer_key:q.answer_key as any })),
    answers
  );
  const band = rawToBand(total);

  // Persist attempt
  const { data: attemptRow, error: aErr } = await supabaseAdmin
    .from('listening_attempts')
    .insert({
      user_id: userId,
      test_slug,
      submitted_at: new Date().toISOString(),
      score: total,
      band,
      section_scores: perSection,
      meta: meta ?? {},
    })
    .select('id')
    .single();

  if (aErr || !attemptRow) return res.status(500).json({ error: aErr?.message || 'Insert failed' });

  // Persist answers (normalized correctness)
  const userAnswers = answers.map(a => {
    const q = (questions ?? []).find(q => q.qno === a.qno);
    return {
      attempt_id: attemptRow.id,
      qno: a.qno,
      answer: a.answer,
      is_correct: q ? ((): boolean => {
        // tiny inline scorer to avoid second import
        if (q.type === 'mcq') return String(a.answer ?? '').trim().toUpperCase() === String(q.answer_key?.value ?? '').trim().toUpperCase();
        if (q.type === 'gap') {
          const n = (s:any)=>String(s??'').toLowerCase().trim().replace(/\s+/g,' ').replace(/[.,/#!$%^&*;:{}=\-_`~()"]/g,'');
          return n(a.answer) === n(q.answer_key?.text);
        }
        if (q.type === 'match') {
          const sort = (p:any[]) => [...(p??[])].map((x:any)=>[Number(x[0]),Number(x[1])]).sort((A,B)=>(A[0]-B[0])||(A[1]-B[1]));
          return JSON.stringify(sort(a.answer)) === JSON.stringify(sort(q.answer_key?.pairs ?? []));
        }
        return false;
      })() : false,
    };
  });

  const { error: uaErr } = await supabaseAdmin
    .from('listening_user_answers')
    .insert(userAnswers);

  if (uaErr) return res.status(500).json({ error: uaErr.message });

  res.status(200).json({ attemptId: attemptRow.id, score: total, band, sectionScores: perSection });
}
