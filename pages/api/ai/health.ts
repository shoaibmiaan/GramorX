// pages/api/ai/health.ts
import { env } from '@/lib/env';
export const config = { runtime: 'edge' };

type Provider = 'gemini' | 'groq' | 'openai';

function pick(): Provider | 'none' {
  const pref = (env.GX_AI_PROVIDER || '').toLowerCase() as Provider;
  if (pref) return pref;
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.GROQ_API_KEY) return 'groq';
  if (env.OPENAI_API_KEY) return 'openai';
  return 'none';
}

export default async function handler() {
  const provider = pick();
  const ok = provider !== 'none';
  return new Response(
    JSON.stringify({
      ok,
      provider,
      keys: {
        gemini: !!env.GEMINI_API_KEY,
        groq: !!env.GROQ_API_KEY,
        openai: !!env.OPENAI_API_KEY,
      },
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  );
}
