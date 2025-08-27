// pages/api/ai/chat.ts
import { env } from '@/lib/env';
export const config = { runtime: 'edge' };

// ---------- Types ----------
type Role = 'system' | 'user' | 'assistant';
type ChatMessage = { role: Role; content: string };
type Provider = 'gemini' | 'groq' | 'openai';

// ---------- Helpers ----------
const enc = new TextEncoder();
const dec = new TextDecoder();
const okEvent = (t: string) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`;
const errEvent = (t: string) =>
  `data: ${JSON.stringify({ error: t })}\n\n`;

const DEFAULTS = {
  // Prefer latest Gemini names, but try your .env first if provided.
  geminiCandidates: [
    ...(env.GEMINI_MODEL ? [env.GEMINI_MODEL] : []),
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ],
  // Groq: try your .env model, then stable fallbacks.
  groqCandidates: [
    ...(env.GROQ_MODEL ? [env.GROQ_MODEL] : []),
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
  ],
  openaiModel: env.OPENAI_MODEL || 'gpt-4o-mini',
};

function chooseProvider(url: URL): Provider {
  const p = (url.searchParams.get('p') || env.GX_AI_PROVIDER || '').toLowerCase() as Provider;
  if (p) return p;
  if (env.GEMINI_API_KEY) return 'gemini';
  if (env.GROQ_API_KEY) return 'groq';
  if (env.OPENAI_API_KEY) return 'openai';
  throw new Error('No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY (or OPENAI_API_KEY).');
}

// Remove unsupported fields (e.g., id) and coerce to {role, content}
function cleanMessages(input: any[]): ChatMessage[] {
  return (Array.isArray(input) ? input : []).map((m) => {
    const role: Role =
      m?.role === 'system' || m?.role === 'assistant' || m?.role === 'user'
        ? m.role
        : 'user';
    const content = typeof m?.content === 'string' ? m.content : String(m?.content ?? '');
    return { role, content };
  });
}

// ---------- OpenAI-compatible (Groq/OpenAI) ----------
async function streamOpenAICompat(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, stream: true, temperature: 0.2, messages }),
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Provider ${url} responded ${resp.status}: ${text}`);
  }

  const reader = resp.body.getReader();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await reader.read().catch((e) => {
        controller.enqueue(enc.encode(errEvent(`read error: ${e?.message || e}`)));
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
        return { value: undefined, done: true };
      });
      if (done) {
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
        return;
      }
      controller.enqueue(value!); // already SSE-formatted upstream
    },
  });
}

async function streamGroqWithFallback(apiKey: string, messages: ChatMessage[]) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  let lastErr = '';
  for (const model of DEFAULTS.groqCandidates) {
    try {
      return await streamOpenAICompat(url, apiKey, model, messages);
    } catch (e: any) {
      const msg = (e?.message || '').toLowerCase();
      lastErr = e?.message || String(e);
      // If model is decommissioned/unknown, try next candidate
      if (
        msg.includes('decommissioned') ||
        msg.includes('no longer supported') ||
        msg.includes('unknown model') ||
        msg.includes('invalid model') ||
        msg.includes('not found')
      ) {
        continue;
      }
      // Other errors (e.g., 401) → stop
      break;
    }
  }
  throw new Error(`Groq failed: ${lastErr}`);
}

// ---------- Gemini (non-stream; wrap as SSE) ----------
function toGeminiContents(msgs: ChatMessage[]) {
  const contents: any[] = [];
  let sys = '';
  for (const m of msgs) {
    if (m.role === 'system') {
      sys += m.content.trim() + '\n\n';
      continue;
    }
    const role = m.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: (role === 'user' && sys ? sys : '') + m.content }],
    });
    if (sys) sys = ''; // prefix system once
  }
  return contents;
}

async function streamGeminiNonStreaming(apiKey: string, messages: ChatMessage[]) {
  let lastErr = '';
  for (const model of DEFAULTS.geminiCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${apiKey}`;
    const payload = {
      contents: toGeminiContents(messages),
      generationConfig: { temperature: 0.2 },
    };

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const textBody = await resp.text();
      if (!resp.ok) throw new Error(textBody || `HTTP ${resp.status}`);

      const json = JSON.parse(textBody);
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p: any) => p?.text || '').join('') || '(no content)';

      // Wrap single response as SSE so the client code stays the same
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(enc.encode(okEvent(text)));
          controller.enqueue(enc.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
    } catch (e: any) {
      lastErr = e?.message || String(e);
      // try next candidate
      continue;
    }
  }
  throw new Error(`Gemini failed: ${lastErr}`);
}

// ---------- Handler ----------
export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const messages: ChatMessage[] = cleanMessages(body.messages || []);
    const provider = chooseProvider(url);

    let stream: ReadableStream<Uint8Array>;
    if (provider === 'groq') {
      const key = env.GROQ_API_KEY;
      if (!key) throw new Error('GROQ_API_KEY is required for Groq provider');
      stream = await streamGroqWithFallback(key, messages);
    } else if (provider === 'openai') {
      const key = env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY is required for OpenAI provider');
      stream = await streamOpenAICompat(
        'https://api.openai.com/v1/chat/completions',
        key,
        DEFAULTS.openaiModel,
        messages,
      );
    } else {
      const key = env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY is required for Gemini provider');
      stream = await streamGeminiNonStreaming(key, messages);
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (e: any) {
    const rs = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(enc.encode(errEvent(`chat error: ${e?.message || e}`)));
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return new Response(rs, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
      status: 200,
    });
  }
}
