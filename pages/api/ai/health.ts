// pages/api/ai/health.ts
export const config = { runtime: 'edge' };

type Provider = 'gemini' | 'groq' | 'openai';

function pick(): Provider | 'none' {
  const pref = (process.env.GX_AI_PROVIDER || '').toLowerCase() as Provider;
  if (pref) return pref;
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
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
        gemini: !!process.env.GEMINI_API_KEY,
        groq: !!process.env.GROQ_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
      },
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  );
}
