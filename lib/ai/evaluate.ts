import type { BandFeedback } from './schema';
import { env } from '@/env';

// Basic mock fallback used when no AI key is available
export async function evaluateSpeakingMock(transcript: string): Promise<BandFeedback> {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const clamp9 = (x: number) => Math.max(4, Math.min(9, x));
  const criteria = [
    { name: 'Fluency & Coherence', score: clamp9(rand(5.5, 8.5)), tip: 'Maintain steady pace and link ideas with signposting.' },
    { name: 'Lexical Resource', score: clamp9(rand(5.0, 8.5)), tip: 'Use topic-specific vocabulary and avoid repetition.' },
    { name: 'Grammatical Range & Accuracy', score: clamp9(rand(5.0, 8.5)), tip: 'Vary sentence structures; keep agreement and tenses consistent.' },
    { name: 'Pronunciation', score: clamp9(rand(5.0, 8.5)), tip: 'Stress key words and articulate consonants clearly.' },
  ];
  const band = Number((criteria.reduce((a, c) => a + c.score, 0) / criteria.length).toFixed(1));
  return { band, criteria, summary: 'Good overall performance. Improve collocations and consistency in tense usage for a higher band.' };
}

export async function evaluateWithOpenAI(prompt: string): Promise<BandFeedback> {
  if (!env.OPENAI_API_KEY) return evaluateSpeakingMock(prompt);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are an IELTS examiner. Return JSON with band, criteria[{name,score,tip}], summary.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await r.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}') as BandFeedback;
  } catch {
    return evaluateSpeakingMock(prompt);
  }
}

export async function evaluateWithGemini(prompt: string): Promise<BandFeedback> {
  if (!env.GEMINI_API_KEY) return evaluateSpeakingMock(prompt);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(text) as BandFeedback;
  } catch {
    return evaluateSpeakingMock(prompt);
  }
}

export async function evaluateWithGrok(prompt: string): Promise<BandFeedback> {
  if (!env.GROQ_API_KEY) return evaluateSpeakingMock(prompt);
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are an IELTS examiner. Return JSON with band, criteria[{name,score,tip}], summary.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const data = await r.json();
    return JSON.parse(data.choices?.[0]?.message?.content || '{}') as BandFeedback;
  } catch {
    return evaluateSpeakingMock(prompt);
  }
}