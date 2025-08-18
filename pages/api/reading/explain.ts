import type { NextApiRequest, NextApiResponse } from 'next';
import { getAttempt } from './reading/submit';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { attemptId, qid } = req.body as { attemptId?: string; qid?: string };
    if (!attemptId || !qid) return res.status(400).json({ error: 'Missing attemptId/qid' });

    const att = getAttempt(attemptId);
    if (!att) return res.status(404).json({ error: 'Attempt not found' });

    const item = att.result.items.find((i: any) => i.id === qid);
    if (!item) return res.status(404).json({ error: 'Question not found in attempt' });

    // Build concise prompt with passage + Q context
    const prompt = [
      `You are an IELTS Reading tutor.`,
      `Passage title: ${att.paperTitle}`,
      att.paper?.passage ? `Passage:\n${att.paper.passage}` : '',
      `Question (Q${item.qNo}, type=${item.type}): ${item.prompt}`,
      item.type === 'mcq' && att.paper ? (
        // try to show options if available on paper
        (() => {
          const q = findPaperQuestion(att.paper, qid);
          return q?.options?.length ? `Options: ${q.options.join(' | ')}` : '';
        })()
      ) : '',
      `User answer: ${stringify(item.user)}`,
      `Correct answer: ${stringify(item.correct)}`,
      `Explain briefly (2–4 lines) why the correct answer is right. Focus on evidence from the passage; avoid revealing extra info not supported by it.`
    ].filter(Boolean).join('\n\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing in env' });

    const r = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 220 }
      })
    });
    const j = await r.json();
    const text =
      j?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Explanation unavailable right now. Please try again.';

    return res.json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Explain failed' });
  }
}

function stringify(v: any) {
  try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v); }
}

function findPaperQuestion(paper: any, qid: string) {
  for (const s of paper?.sections || []) {
    for (const q of s.questions || []) if (q.id === qid) return q;
  }
  return null;
}
