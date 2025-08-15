import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const slug = String(req.query.slug);

  const [{ data: test, error: e1 }, { data: sections, error: e2 }, { data: questions, error: e3 }] =
    await Promise.all([
      supabaseAdmin.from('listening_tests').select('slug,title,audio_url').eq('slug', slug).single(),
      supabaseAdmin.from('listening_sections').select('id,order_no,start_ms,end_ms,transcript').eq('test_slug', slug).order('order_no'),
      supabaseAdmin.from('listening_questions').select('*').eq('test_slug', slug).order('qno')
    ]);

  if (e1 || e2 || e3 || !test) return res.status(404).json({ error: e1?.message || e2?.message || e3?.message || 'Not found' });

  const qs = (questions ?? []).map(q => {
    if (q.type === 'mcq') return { type:'mcq', qno:q.qno, prompt:q.prompt, options:q.options, key:{ value:q.answer_key?.value } };
    if (q.type === 'gap') return { type:'gap', qno:q.qno, prompt:q.prompt, key:{ text:q.answer_key?.text } };
    return { type:'match', qno:q.qno, prompt:q.prompt, left:q.match_left, right:q.match_right, key:{ pairs:q.answer_key?.pairs ?? [] } };
  });

  res.json({
    slug: test.slug,
    title: test.title,
    audioUrl: test.audio_url,
    sections: (sections ?? []).map(s => ({ order: s.order_no, startMs: s.start_ms, endMs: s.end_ms, transcript: s.transcript })),
    questions: qs,
  });
}
