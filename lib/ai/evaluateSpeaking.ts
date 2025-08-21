import { env } from "@/lib/env";
// /lib/ai/evaluateSpeaking.ts
import Groq from 'groq-sdk';

export type Feedback = {
  band?: number;
  summary?: string;
  aspects?: Array<{ key: 'fluency'|'lexical'|'grammar'|'pronunciation'; band: number; note?: string }>;
};

export type EvalInputs = {
  transcript?: string;     // optional, but HIGHLY improves feedback
  seconds?: number;        // speaking time
  ctx: 'p1'|'p2'|'p3'|'chat';
};

const SYSTEM_JSON_SPEC = `
Return ONLY strict minified JSON like:
{"band":7,"summary":"...","aspects":[{"key":"fluency","band":7,"note":"..."},{"key":"lexical","band":6.5,"note":"..."},{"key":"grammar","band":6.5,"note":"..."},{"key":"pronunciation","band":7,"note":"..."}]}
No markdown, no explanations, no trailing commas. Band must be 0..9 with 0.5 steps.
`;

function buildPrompt({ transcript, seconds, ctx }: EvalInputs) {
  const partName = ctx==='p1' ? 'Part 1' : ctx==='p2' ? 'Part 2' : ctx==='p3' ? 'Part 3' : 'Practice';
  return `
You are an IELTS Speaking examiner. Evaluate the candidate’s answer for ${partName}.
Consider Fluency/Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.

Speaking time (sec): ${seconds ?? 'unknown'}
Transcript (verbatim, may include ASR mistakes):
${transcript ?? '(no transcript provided)'}

${SYSTEM_JSON_SPEC}
`.trim();
}

// ---------- Gemini path ----------
export async function evaluateWithGemini(input: EvalInputs, apiKey = env.GEMINI_API_KEY): Promise<Feedback | null> {
  if (!apiKey) return null;
  // lightweight fetch to avoid adding SDK if you prefer
  const prompt = buildPrompt(input);

  const resp = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}] }),
    }
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const m = text.match(/\{[\s\S]*\}$/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as Feedback; } catch { return null; }
}

// ---------- Groq LLM path (e.g., Llama 3.1 70B) ----------
export async function evaluateWithGroq(input: EvalInputs, apiKey = env.GROQ_API_KEY): Promise<Feedback | null> {
  if (!apiKey) return null;
  const groq = new Groq({ apiKey });
  const prompt = buildPrompt(input);

  const chat = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    temperature: 0.2,
    max_tokens: 700,
    messages: [
      { role: 'system', content: 'You output strict minified JSON only.' },
      { role: 'user', content: prompt }
    ],
  });

  const text = chat.choices?.[0]?.message?.content?.trim() || '';
  try { return JSON.parse(text) as Feedback; } catch {
    // try to salvage JSON if model wrapped anything
    const m = text.match(/\{[\s\S]*\}$/);
    if (!m) return null;
    try { return JSON.parse(m[0]) as Feedback; } catch { return null; }
  }
}

// ---------- Groq Whisper transcription ----------
export async function transcribeWithGroq(audioBytes: Buffer, filename = 'audio.webm', apiKey = env.GROQ_API_KEY): Promise<string | null> {
  if (!apiKey) return null;
  const groq = new Groq({ apiKey });
  // The Groq SDK expects a File (Web API). In Node 18+, File exists globally.
  const file = new File([audioBytes], filename, { type: 'audio/webm' });
  const r = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
    temperature: 0.0
  });
  // @ts-ignore types: r.text exists in verbose_json
  const text: string | undefined = (r as any)?.text || (r as any)?.segments?.map((s: any) => s.text).join(' ');
  return text?.trim() || null;
}

// ---------- Fallback (never blocks UI) ----------
export function fallbackFeedback(): Feedback {
  return {
    band: 6.5,
    summary: 'Clear overall message. Extend ideas with examples, tighten grammar in complex sentences, and vary intonation.',
    aspects: [
      { key: 'fluency', band: 6.5, note: 'Keep steady pace; add linking phrases.' },
      { key: 'lexical', band: 6.5, note: 'Use more precise topic vocabulary.' },
      { key: 'grammar', band: 6, note: 'Minor tense/agreement slips; try complex clauses.' },
      { key: 'pronunciation', band: 7, note: 'Mostly clear; improve stress/intonation variety.' },
    ],
  };
}
