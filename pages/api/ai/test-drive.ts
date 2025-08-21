import { env } from "@/lib/env";
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Ok = { ok: true; answer: string };
type Err = { ok: false; error: string };

function trimToThreeLines(text: string): string {
  const cleaned = text.replace(/\r/g, '').replace(/\n{2,}/g, '\n').trim();
  const lines = cleaned.split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length <= 3) return lines.join('\n');
  if (lines.length === 1) {
    const sentences = cleaned.split(/(?<=[.!?])\s+/).slice(0, 3);
    return sentences.join(' ');
  }
  return lines.slice(0, 3).join('\n');
}

// tiny cooldown via cookie (best-effort; not bulletproof)
function recent(req: NextApiRequest, name: string, ms: number) {
  const cookie = (req.headers.cookie || '').split(';').map(c=>c.trim());
  const hit = cookie.find(c => c.startsWith(`${name}=`));
  if (!hit) return false;
  const ts = Number(hit.split('=')[1] || 0);
  return Number.isFinite(ts) && Date.now() - ts < ms;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Public: no auth required
  if (recent(req, 'aidemo', 8000)) {
    return res.status(429).json({ ok: false, error: 'Please wait a few seconds before trying again.' });
  }

  const question = (req.body?.question ?? '').toString().trim();
  if (!question) return res.status(400).json({ ok: false, error: 'Enter a short question.' });
  if (question.length > 200) return res.status(400).json({ ok: false, error: 'Keep it under 200 characters.' });

  try {
    const key = env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: 'Gemini key missing on server.' });

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = [
      'You are a concise IELTS study assistant.',
      'Answer the user’s question in **no more than 2–3 lines**.',
      'Avoid markdown lists; be direct and actionable.',
      `Question: ${question}`
    ].join('\n');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = result.response.text().trim();
    const answer = trimToThreeLines(raw);

    // set cooldown cookie (~8s)
    res.setHeader('Set-Cookie', `aidemo=${Date.now()}; Path=/; HttpOnly; SameSite=Lax`);
    return res.status(200).json({ ok: true, answer });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? 'AI test failed' });
  }
}
