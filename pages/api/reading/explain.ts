// pages/api/reading/explain.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Lightweight, zero-dependency explanation generator.
 * - Accepts passage HTML/text, question meta, userAnswer, correctAnswer
 * - Strips HTML, pulls the most relevant sentence(s) using prompt keywords
 * - Returns a concise, DS-friendly explanation string
 *
 * This is deterministic (no external API). You can later swap the "reason"
 * with an LLM call; the request/response contract stays the same.
 */

type Kind = 'tfng' | 'mcq' | 'matching' | 'short';
type QuestionMeta = { kind: Kind; prompt: string; id: string };

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','than','that','this','those','these','is','are','was','were','be','been','being',
  'in','on','at','by','for','to','of','as','with','from','into','about','over','under','between','through','per','via',
  'it','its','they','them','their','there','here','we','you','i','he','she','his','her','our','your','my',
  'which','who','whom','what','when','where','why','how',
]);

function stripHtml(htmlOrText: string): string {
  const noTags = htmlOrText.replace(/<[^>]+>/g, ' ');
  return noTags.replace(/\s+/g, ' ').trim();
}

function sentences(text: string): string[] {
  // Split on . ! ? while keeping reasonable sentence boundaries
  return text
    .split(/(?<=[.!?])\s+/g)
    .map(s => s.trim())
    .filter(Boolean);
}

function keywords(s: string, max = 8): string[] {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/g)
    .filter(w => w && !STOPWORDS.has(w) && w.length > 2);
  // de-duplicate, keep first occurrences
  const uniq: string[] = [];
  for (const w of base) if (!uniq.includes(w)) uniq.push(w);
  return uniq.slice(0, max);
}

function scoreSentence(s: string, keys: string[]): number {
  const lower = s.toLowerCase();
  let score = 0;
  for (const k of keys) {
    if (lower.includes(k)) score += 1;
  }
  return score;
}

function bestSnippets(text: string, prompt: string, take = 2): string {
  const keys = keywords(prompt);
  const ss = sentences(text);
  const ranked = ss
    .map(s => ({ s, sc: scoreSentence(s, keys) }))
    .filter(x => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, take)
    .map(x => x.s);
  return ranked.join(' ');
}

const norm = (v: any) =>
  typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').toLowerCase() : v;

function eqAnswer(kind: Kind, a: any, b: any): boolean {
  if (kind === 'matching') {
    return Array.isArray(a) &&
           Array.isArray(b) &&
           a.length === b.length &&
           a.every((v, i) => norm(v) === norm(b[i]));
  }
  if (Array.isArray(b)) {
    // mcq/tfng often send ['Correct']; short may send ['syn1','syn2']
    if (Array.isArray(a)) return norm(a.join(',')) === norm(b.join(','));
    return b.some(x => norm(x) === norm(a));
  }
  return norm(a) === norm(b);
}

function reason(kind: Kind, user: any, correct: any, snippet: string): string {
  const userStr = Array.isArray(user) ? user.join(', ') : String(user ?? '—');
  const correctStr = Array.isArray(correct) ? correct.join(', ') : String(correct ?? '—');

  switch (kind) {
    case 'tfng':
      return `Your answer was **${userStr}**. The correct answer is **${correctStr}**. ` +
        `In the passage, the relevant information indicates this is ${String(correctStr).toUpperCase()}. ${snippet ? `Context: “${snippet}”` : ''}`;

    case 'mcq':
      return `You chose **${userStr}**. The correct option is **${correctStr}**. ` +
        `The passage supports the correct option; look for wording aligned with it. ${snippet ? `Context: “${snippet}”` : ''}`;

    case 'short':
      return `You wrote **${userStr}**. Accepted answer(s): **${correctStr}** (minor spelling variants/synonyms may be accepted). ` +
        `${snippet ? `Context: “${snippet}”` : ''}`;

    case 'matching':
      return `Your mapping differs from the expected mapping. Expected: **${correctStr}**; yours: **${userStr}**. ` +
        `Re-check how each left-hand item is supported by the passage details. ${snippet ? `Context: “${snippet}”` : ''}`;

    default:
      return `The correct answer is **${correctStr}**. ${snippet ? `Context: “${snippet}”` : ''}`;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { passage, question, userAnswer, correctAnswer } = (req.body || {}) as {
      passage: string;
      question: QuestionMeta;
      userAnswer: any;
      correctAnswer: any;
    };

    if (!passage || !question || !question.kind || !question.prompt) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const text = stripHtml(passage);
    const snippet = bestSnippets(text, question.prompt, 2);

    if (eqAnswer(question.kind, userAnswer, correctAnswer)) {
      const msg =
        question.kind === 'short'
          ? `Correct — your answer matches an accepted variant. ${snippet ? `Context: “${snippet}”` : ''}`
          : `Correct — your answer matches the passage. ${snippet ? `Context: “${snippet}”` : ''}`;
      return res.status(200).json({ explanation: msg });
    }

    const msg = reason(question.kind, userAnswer, correctAnswer, snippet);
    return res.status(200).json({ explanation: msg });
  } catch (e: any) {
    return res.status(200).json({
      explanation:
        'Here is a general hint: re-read the paragraph that contains the main keywords from the question, and match wording carefully to the options.',
    });
  }
}
