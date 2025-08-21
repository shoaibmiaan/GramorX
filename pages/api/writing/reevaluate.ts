import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const BodySchema = z.object({
  attemptId: z.string().uuid(),
  mode: z.enum(['balanced', 'strict', 'coaching']),
  focus: z.array(z.enum(['task', 'coherence', 'lexical', 'grammar', 'tone'])).optional().default([]),
});

const ReevalSchema = z.object({
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

function promptForGemini(args: {
  mode: 'balanced' | 'strict' | 'coaching';
  focus: string[];
  task_type: 'T1' | 'T2' | 'GT';
  prompt: string;
  essay_text: string;
}) {
  const { mode, focus, task_type, prompt, essay_text } = args;

  const modeText =
    mode === 'strict'
      ? `Be conservative. Penalize structure/grammar more.`
      : mode === 'coaching'
      ? `Be supportive. Include concrete tips and short examples.`
      : `Be neutral and rubric-faithful.`;

  const focusText = focus.length
    ? `Prioritize these areas: ${focus.join(', ')}.`
    : `Evaluate all criteria evenly.`;

  return [
    `You are an IELTS examiner. Evaluate the essay strictly using IELTS ${task_type === 'GT' ? 'General Training Letter' : task_type === 'T1' ? 'Task 1 (Academic)' : 'Task 2'} rubrics.`,
    modeText,
    focusText,
    `Return ONLY JSON with keys: band_overall (number, 0–9, use 0.5 increments), band_breakdown (object with task, coherence, lexical, grammar numbers), feedback (string), model (string: an ideal model answer outline or response appropriate to ${task_type}).`,
    `Essay prompt:\n${prompt}`,
    `---`,
    `Student essay:\n${essay_text}`,
  ].join('\n\n');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1) Auth (user must be logged in)
  const { createServerSupabaseClient } = await import('@supabase/auth-helpers-nextjs');
  const supabase = createServerSupabaseClient({ req, res });
  const { data: userResp, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userResp?.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = userResp.user.id;

  // 2) Validate body
  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid body', details: parse.error.flatten() });
  const { attemptId, mode, focus } = parse.data;

  // 3) Fetch attempt (and ensure ownership)
  const { data: attempt, error: attemptErr } = await supabase
    .from('writing_attempts')
    .select('id, user_id, task_type, prompt, essay_text')
    .eq('id', attemptId)
    .single();

  if (attemptErr) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.user_id && attempt.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

  // 4) Call Gemini
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // or 'gemini-1.5-flash' for cheaper/faster

    const prompt = promptForGemini({
      mode,
      focus,
      task_type: attempt.task_type as 'T1' | 'T2' | 'GT',
      prompt: attempt.prompt,
      essay_text: attempt.essay_text,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      } as any,
    });

    const text = result.response.text();
    const parsed = ReevalSchema.parse(JSON.parse(text));

    // 5) Persist re-eval
    const insertPayload = {
      attempt_id: attemptId,
      mode,
      focus,
      band_overall: parsed.band_overall,
      band_breakdown: parsed.band_breakdown,
      feedback: parsed.feedback,
      model: parsed.model,
    };

    const { data: saved, error: insErr } = await supabase
      .from('writing_reevals')
      .insert(insertPayload)
      .select('id, attempt_id, mode, focus, band_overall, band_breakdown, feedback, model, created_at')
      .single();

    if (insErr) return res.status(500).json({ error: 'Failed to save re-eval', details: insErr.message });

    return res.status(200).json(saved);
  } catch (e: any) {
    // Handle malformed JSON or LLM errors gracefully
    return res.status(500).json({
      error: 'LLM evaluation failed',
      details: e?.message ?? String(e),
    });
  }
}
