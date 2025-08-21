import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';

const GROQ = env.GROQ_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { transcript = '' } = req.body as { transcript?: string };
    if (!transcript.trim()) return res.status(400).json({ error: 'No transcript' });
    if (!GROQ) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });

    const prompt = `
You are an IELTS Speaking coach. Read the student's transcript (dialogue labeled "Partner:" and "You:").
1) Give a brief, motivating verdict (one of: Needs work / Fair / Good / Very good / Excellent).
2) Bullet points: strengths.
3) Bullet points: issues (fluency, grammar, lexical resource, pronunciation markers).
4) Actionable mini-plan for next practice (3 bullets, concrete).
Keep it concise, no markdown headings, no emojis.
Transcript:
${transcript}
`;

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || 'LLM error');
    const text = String(j?.choices?.[0]?.message?.content || '').trim();

    res.status(200).json({ feedback: text });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
}
