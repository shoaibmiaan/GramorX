import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const BodySchema = z.object({
  attemptId: z.string().optional(),   // if provided, we’ll look for a transcript or audio (future)
  transcript: z.string().optional(),  // if provided, we grade based on this text
});

type AIFeedback = {
  bandOverall: number;
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  notes: string[];
};

type Resp = { ok: true; feedback: AIFeedback } | { ok: false; error: string };

const openaiModel = process.env.OPENAI_SPEAKING_MODEL || 'gpt-4o-mini';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: parse.error.issues.map(i => i.message).join(', ') });
  }
  const { attemptId, transcript } = parse.data;

  // 1) Try transcript (provided directly)
  let text = (transcript || '').trim();

  // 2) Fallback: if attemptId provided and `attempts_speaking.transcript` exists, use that
  if (!text && attemptId && process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      );
      const { data } = await supabase.from('attempts_speaking').select('transcript').eq('id', attemptId).single();
      if (data?.transcript) text = String(data.transcript);
    } catch {
      // ignore
    }
  }

  // 3) Grade
  let feedback: AIFeedback;
  try {
    if (process.env.OPENAI_API_KEY && text) {
      feedback = await gradeWithOpenAI(text);
    } else {
      feedback = heuristic(text);
    }
  } catch {
    feedback = heuristic(text);
  }

  return res.status(200).json({ ok: true, feedback });
}

function heuristic(text: string): AIFeedback {
  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
  const base = 6 + Math.min(1, Math.max(0, (wc - 120) / 200));
  const band = clampHalf(base, 4, 9);
  return {
    bandOverall: band,
    fluency: clampHalf(band - 0.5, 4, 9),
    lexical: clampHalf(band, 4, 9),
    grammar: clampHalf(band - 0.5, 4, 9),
    pronunciation: clampHalf(band, 4, 9),
    notes: [
      'Maintain steady pace; avoid long pauses.',
      'Use more topic-specific vocabulary.',
      'Vary sentence structures; check articles and prepositions.',
      'Chunk ideas and use signposting (firstly, moreover).',
    ],
  };
}

async function gradeWithOpenAI(transcript: string): Promise<AIFeedback> {
  const prompt = `You are an IELTS Speaking examiner. Grade the following transcript.
Return ONLY JSON with keys: bandOverall, fluency, lexical, grammar, pronunciation, notes (array).
Transcript:
${transcript}
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
  const out = JSON.parse(content || '{}');

  const band = clampHalf(Number(out.bandOverall ?? 6), 4, 9);
  return {
    bandOverall: band,
    fluency: clampHalf(Number(out.fluency ?? band - 0.5), 4, 9),
    lexical: clampHalf(Number(out.lexical ?? band), 4, 9),
    grammar: clampHalf(Number(out.grammar ?? band - 0.5), 4, 9),
    pronunciation: clampHalf(Number(out.pronunciation ?? band), 4, 9),
    notes: Array.isArray(out.notes) ? out.notes.slice(0, 8) : ['Speak steadily and expand answers.'],
  };
}

const clampHalf = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(n * 2) / 2));
