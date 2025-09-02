import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const ItemSchema = z.object({
  id: z.string().optional(),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
  userAnswer: z.string().optional().default(''),
  passage: z.string().optional(), // for Reading explanations
});

const BodySchema = z.object({
  module: z.enum(['reading', 'listening']),
  items: z.array(ItemSchema).min(1),
});

type Explanation = {
  id?: string;
  correct: string;
  user: string;
  isCorrect: boolean;
  explanation: string;
  tip: string;
};

type Resp = { ok: true; explanations: Explanation[] } | { ok: false; error: string };

const openaiModel = process.env.OPENAI_EXPLAIN_MODEL || 'gpt-4o-mini';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ ok: false, error: parse.error.issues.map(i => i.message).join(', ') });

  const { module, items } = parse.data;

  try {
    const exps: Explanation[] = [];
    for (const it of items) {
      // Try OpenAI if available; otherwise, use a strong heuristic
      const exp = process.env.OPENAI_API_KEY
        ? await explainWithOpenAI(module, it)
        : explainHeuristic(module, it);
      exps.push(exp);
    }
    return res.status(200).json({ ok: true, explanations: exps });
  } catch (e: any) {
    return res.status(200).json({
      ok: true,
      explanations: items.map((it) => explainHeuristic(module, it)),
    });
  }
}

function explainHeuristic(module: 'reading'|'listening', it: z.infer<typeof ItemSchema>): Explanation {
  const ua = (it.userAnswer || '').trim();
  const correct = (it.answer || '').trim();
  const isCorrect = ua.toLowerCase() === correct.toLowerCase();

  const baseTip = module === 'reading'
    ? 'Scan for keywords, then read the surrounding sentence carefully to confirm meaning.'
    : 'Listen for signpost words and note synonyms that paraphrase the choices.';

  const why = isCorrect
    ? 'Your choice matches the key detail required by the question.'
    : `The correct answer is supported by a specific phrase that your choice does not satisfy.`;

  return {
    id: it.id,
    correct,
    user: ua,
    isCorrect,
    explanation: [
      module === 'reading' && it.passage ? `In the passage, look for: "${snippet(it.passage, correct)}".` : '',
      why,
    ].filter(Boolean).join(' '),
    tip: baseTip,
  };
}

async function explainWithOpenAI(module: 'reading'|'listening', it: z.infer<typeof ItemSchema>): Promise<Explanation> {
  const sys = `You are an IELTS ${module} tutor. Explain briefly (2–4 sentences) why the correct answer fits, referencing exact phrasing. Return ONLY JSON with keys: explanation, tip.`;
  const user = `Question: ${it.prompt}
Options: ${it.options?.join(' | ') || '(open)'}
Correct answer: ${it.answer}
User answer: ${it.userAnswer ?? ''}
${module === 'reading' && it.passage ? 'Passage: ' + it.passage : ''}`;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: openaiModel, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], temperature: 0.2, response_format: { type: 'json_object' } }),
  });
  if (!r.ok) throw new Error('OpenAI error');
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content || '{}');

  const ua = (it.userAnswer || '').trim();
  const correct = (it.answer || '').trim();
  const isCorrect = ua.toLowerCase() === correct.toLowerCase();

  return {
    id: it.id,
    correct,
    user: ua,
    isCorrect,
    explanation: String(parsed.explanation ?? ''),
    tip: String(parsed.tip ?? 'Verify keywords and paraphrases against the text/audio.'),
  };
}

function snippet(text: string, needle: string, radius = 40) {
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return text.slice(0, Math.min(text.length, radius * 2)) + (text.length > radius * 2 ? '…' : '');
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + needle.length + radius);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}
