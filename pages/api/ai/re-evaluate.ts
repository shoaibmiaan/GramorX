import { env } from '@/lib/env';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { recordReevaluationCredit } from '@/lib/credits';

const BodySchema = z.object({
  attemptId: z.string().uuid(),
});

const EvalSchema = z.object({
  band_overall: z.number().min(0).max(9),
  band_breakdown: z.object({
    task: z.number().min(0).max(9),
    coherence: z.number().min(0).max(9),
    lexical: z.number().min(0).max(9),
    grammar: z.number().min(0).max(9),
  }),
  feedback: z.string().min(1),
  model: z.string().min(1),
});

function buildPrompt(args: { task_type: 'T1'|'T2'|'GT'; prompt: string; essay_text: string; }) {
  const { task_type, prompt, essay_text } = args;
  return [
    `You are an IELTS examiner. Evaluate the essay using IELTS ${task_type === 'GT' ? 'General Training Letter' : task_type === 'T1' ? 'Task 1 (Academic)' : 'Task 2'} rubrics.`,
    `Return ONLY JSON with keys: band_overall (number, 0–9, use 0.5 increments), band_breakdown (object with task, coherence, lexical, grammar numbers), feedback (string), model (string: an ideal model answer).`,
    `Essay prompt:\n${prompt}`,
    `---`,
    `Student essay:\n${essay_text}`,
  ].join('\n\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createServerSupabaseClient({ req, res });
  const { data: userResp, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userResp?.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = userResp.user.id;

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid body', details: parse.error.flatten() });
  const { attemptId } = parse.data;

  const { data: attempt, error: attemptErr } = await supabase
    .from('writing_attempts')
    .select('id, user_id, task_type, prompt, essay_text')
    .eq('id', attemptId)
    .single();
  if (attemptErr || !attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.user_id && attempt.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = buildPrompt({
      task_type: attempt.task_type as 'T1'|'T2'|'GT',
      prompt: attempt.prompt,
      essay_text: attempt.essay_text,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' } as any,
    });

    const text = result.response.text();
    const parsed = EvalSchema.parse(JSON.parse(text));

    recordReevaluationCredit(userId);

    return res.status(200).json(parsed);
  } catch (e: any) {
    return res.status(500).json({ error: 'LLM evaluation failed', details: e?.message ?? String(e) });
  }
}
