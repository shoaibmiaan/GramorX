import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Optional: service-side Supabase (used only if you pass attemptId to persist)
import { createClient } from '@supabase/supabase-js';

const BodySchema = z.object({
  task1: z.string().min(1, 'task1 required'),
  task2: z.string().min(1, 'task2 required'),
  attemptId: z.string().optional(), // if provided, we'll persist AI feedback to attempts_writing.ai_feedback
});

type AIFeedback = {
  bandOverall: number;
  criteria: {
    taskAchievement: number;
    coherence: number;
    lexical: number;
    grammar: number;
  };
  notes: string[];
};

type Resp =
  | { ok: true; feedback: AIFeedback }
  | { ok: false; error: string };

const openaiModel = process.env.OPENAI_WRITING_MODEL || 'gpt-4o-mini';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: parse.error.issues.map(i => i.message).join(', ') });
  }
  const { task1, task2, attemptId } = parse.data;

  // Try OpenAI if key present, otherwise use heuristic
  let feedback: AIFeedback;
  try {
    if (process.env.OPENAI_API_KEY) {
      feedback = await gradeWithOpenAI(task1, task2);
    } else {
      feedback = heuristic(task1, task2);
    }
  } catch (e: any) {
    feedback = heuristic(task1, task2);
  }

  // Optional: persist to attempts_writing.ai_feedback if attemptId provided
  if (attemptId && process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      );
      await supabase.from('attempts_writing').update({ ai_feedback: feedback }).eq('id', attemptId);
    } catch {
      // ignore persistence errors
    }
  }

  return res.status(200).json({ ok: true, feedback });
}

function heuristic(t1: string, t2: string): AIFeedback {
  const wc = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const w1 = wc(t1), w2 = wc(t2);
  const base = 5.5 + Math.min(1.0, Math.max(0, (w1 - 150) / 300)) + Math.min(1.5, Math.max(0, (w2 - 250) / 500));
  const band = clampHalf(base, 4, 9);
  return {
    bandOverall: band,
    criteria: {
      taskAchievement: clampHalf(5 + (w1 >= 150 ? 1 : 0), 4, 9),
      coherence:  clampHalf(5.5 + (w2 >= 250 ? 0.5 : 0), 4, 9),
      lexical:    clampHalf(5.5, 4, 9),
      grammar:    clampHalf(5.5, 4, 9),
    },
    notes: [
      'Use clear topic sentences and logical paragraphing.',
      'Vary cohesive devices (however, furthermore, consequently).',
      'Aim for precise vocabulary; reduce repetition.',
      'Check complex sentences for agreement and punctuation.',
    ],
  };
}
const clampHalf = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(n * 2) / 2));

async function gradeWithOpenAI(task1: string, task2: string): Promise<AIFeedback> {
  const prompt = `You are an IELTS examiner. Grade the two essays below. Return ONLY a compact JSON with keys:
  bandOverall (number 4-9, halves allowed),
  criteria { taskAchievement, coherence, lexical, grammar } (numbers with halves),
  notes (array of short coaching bullets).
  Essays:
  [Task 1]
  ${task1}

  [Task 2]
  ${task2}
  `;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: openaiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  });
  if (!r.ok) throw new Error('OpenAI error');
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content;
  const out = JSON.parse(content);
  // Minimal shape guard
  return {
    bandOverall: clampHalf(Number(out.bandOverall ?? 6), 4, 9),
    criteria: {
      taskAchievement: clampHalf(Number(out?.criteria?.taskAchievement ?? 6), 4, 9),
      coherence: clampHalf(Number(out?.criteria?.coherence ?? 6), 4, 9),
      lexical: clampHalf(Number(out?.criteria?.lexical ?? 6), 4, 9),
      grammar: clampHalf(Number(out?.criteria?.grammar ?? 6), 4, 9),
    },
    notes: Array.isArray(out?.notes) ? out.notes.slice(0, 8) : ['Organize ideas clearly.', 'Use precise vocabulary.', 'Vary sentence structures.'],
  };
}
