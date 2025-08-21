import { env } from "@/lib/env";
// pages/api/speaking/score-groq.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const OutputSchema = z.object({
  fluency: z.number().min(0).max(9),
  lexical: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
  pronunciation: z.number().min(0).max(9),
  overall: z.number().min(0).max(9),
  feedback: z.string().min(4).max(800),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transcript, part } = (req.body ?? {}) as {
    transcript?: string;
    part?: 'p1' | 'p2' | 'p3';
  };
  if (!transcript || !transcript.trim()) return res.status(400).json({ error: 'Transcript is required' });

  const systemPrompt = `
You are an IELTS Speaking examiner. Score strictly with the official descriptors:

Criteria
1) Fluency & Coherence
2) Lexical Resource
3) Grammatical Range & Accuracy
4) Pronunciation

Rules
- Return JSON ONLY, no prose.
- Give band (0–9) for each criterion.
- "overall" = average of the four, rounded to nearest 0.5.
- "feedback" = 2–3 sentences with concrete improvements (actionable, concise).
- Assume this is part ${part ?? 'unknown'}.
- JSON shape:
{
  "fluency": number,
  "lexical": number,
  "grammar": number,
  "pronunciation": number,
  "overall": number,
  "feedback": string
}
`;

  try {
    const completion = await groq.chat.completions.create({
      // Good free-tier model; you can switch to 8B if you hit limits
      model: 'llama-3.1-70b-versatile',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: transcript.trim() },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? '';

    // Try strict JSON parse first
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: extract the first {...} block
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        parsed = JSON.parse(m[0]);
      }
    }
    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return JSON', raw });
    }

    // If "overall" missing/wrong, compute and round to nearest 0.5
    const toNum = (v: any) => (typeof v === 'number' ? v : Number(v));
    const f = toNum(parsed.fluency);
    const l = toNum(parsed.lexical);
    const g = toNum(parsed.grammar);
    const p = toNum(parsed.pronunciation);

    let overall = toNum(parsed.overall);
    if (!isFinite(overall)) {
      const avg = (f + l + g + p) / 4;
      overall = Math.round(avg * 2) / 2; // nearest 0.5
      parsed.overall = overall;
    }

    // Validate & coerce
    const safe = OutputSchema.safeParse(parsed);
    if (!safe.success) {
      return res.status(422).json({ error: 'Invalid JSON shape', issues: safe.error.issues, raw });
    }

    return res.status(200).json(safe.data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
