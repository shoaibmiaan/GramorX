import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import OpenAI from 'openai';
import { env } from '@/lib/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const attemptId = String(req.query.attemptId || '');
  if (!attemptId) return res.status(400).json({ error: 'Missing attemptId' });

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: attempt, error: aErr } = await supabaseAdmin
    .from('exam_attempts')
    .select('id,user_id,text,band_overall,band_breakdown,feedback')
    .eq('id', attemptId)
    .single();

  if (aErr || !attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

  // If already scored, return cached result
  if (attempt.band_overall && attempt.band_breakdown && attempt.feedback) {
    return res.status(200).json({
      attemptId,
      band: attempt.band_overall,
      criteria: attempt.band_breakdown,
      feedback: attempt.feedback,
    });
  }

  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const prompt = `You are an IELTS examiner. Score the essay below and respond with JSON {"band":number,"criteria":{"task":number,"coherence":number,"lexical":number,"grammar":number},"feedback":string}.\n\nEssay:\n"""${attempt.text || ''}"""`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const raw = completion.choices[0].message?.content || '{}';
    let parsed: { band: number; criteria: any; feedback: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Failed to parse AI response: ' + raw);
    }

    await supabaseAdmin
      .from('exam_attempts')
      .update({
        band_overall: parsed.band,
        band_breakdown: parsed.criteria,
        feedback: parsed.feedback,
      })
      .eq('id', attemptId);

    return res.status(200).json({ attemptId, ...parsed });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Scoring failed' });
  }
}
