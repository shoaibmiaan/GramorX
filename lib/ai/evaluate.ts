import type { BandFeedback } from "./schema";
// MOCK evaluator (works offline). Replace with real calls later.
export async function evaluateSpeakingMock(transcript: string): Promise<BandFeedback> {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const clamp9 = (x: number) => Math.max(4, Math.min(9, x));
  const criteria = [
    { name: "Fluency & Coherence", score: clamp9(rand(5.5, 8.5)), tip: "Maintain steady pace and link ideas with signposting." },
    { name: "Lexical Resource", score: clamp9(rand(5.0, 8.5)), tip: "Use topic-specific vocabulary and avoid repetition." },
    { name: "Grammatical Range & Accuracy", score: clamp9(rand(5.0, 8.5)), tip: "Vary sentence structures; keep agreement and tenses consistent." },
    { name: "Pronunciation", score: clamp9(rand(5.0, 8.5)), tip: "Stress key words and articulate consonants clearly." },
  ];
  const band = Number((criteria.reduce((a, c) => a + c.score, 0) / criteria.length).toFixed(1));
  return { band, criteria, summary: "Good overall performance. Improve collocations and consistency in tense usage for a higher band." };
}
// Provider placeholders (wire later)
export async function evaluateWithOpenAI(prompt: string): Promise<BandFeedback> { if (!process.env.OPENAI_API_KEY) return evaluateSpeakingMock(prompt); return evaluateSpeakingMock(prompt); }
export async function evaluateWithGemini(prompt: string): Promise<BandFeedback> { if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return evaluateSpeakingMock(prompt); return evaluateSpeakingMock(prompt); }
export async function evaluateWithGrok(prompt: string): Promise<BandFeedback> { if (!process.env.GROQ_API_KEY) return evaluateSpeakingMock(prompt); return evaluateSpeakingMock(prompt); }