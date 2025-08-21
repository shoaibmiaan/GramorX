import { env } from "@/lib/env";
// pages/api/speaking/partner.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type HistoryMsg = { role: 'bot' | 'assistant' | 'user'; text: string };

const GROQ = env.GROQ_API_KEY;

// Utility: keep errors short (no HTML blobs)
function nice(e: any) {
  const t = typeof e === 'string' ? e : e?.message || '';
  return t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'Server error';
}

export const config = { api: { bodyParser: { sizeLimit: '26mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const {
      attemptId,
      history = [] as HistoryMsg[],
      userText = '',
      audioBase64,
      mime = 'audio/webm',
      audioUrl, // optional (Storage key for the chat clip)
    } = (req.body || {}) as {
      attemptId?: string;
      history?: HistoryMsg[];
      userText?: string;
      audioBase64?: string;
      mime?: string;
      audioUrl?: string;
    };

    if (!GROQ) return res.status(500).json({ error: 'Missing GROQ_API_KEY' });

    // 1) Normalize history to OpenAI-style messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content:
          'You are an IELTS Speaking practice partner. Be concise and natural. ' +
          'Ask one question at a time. Use follow-ups when answers are short or vague. ' +
          'Avoid repeating the exact question text; paraphrase. No markdown.',
      },
    ];

    for (const m of history as HistoryMsg[]) {
      const role = m.role === 'bot' ? 'assistant' : (m.role as 'assistant' | 'user');
      if (!m?.text) continue;
      messages.push({ role, content: m.text });
    }

    // 2) If a voice clip is present → transcribe it
    let transcript = '';
    if (audioBase64) {
      const bytes = Buffer.from(audioBase64, 'base64');
      const blob = new Blob([bytes], { type: mime });
      const fd = new FormData();
      fd.append('file', blob, `audio.${mime.includes('wav') ? 'wav' : 'webm'}`);
      fd.append('model', 'whisper-large-v3-turbo');

      const stt = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ}` },
        body: fd,
      });
      const sttJson = await stt.json();
      if (!stt.ok) throw new Error(sttJson?.error?.message || 'Transcription failed');
      transcript = String(sttJson.text || '').trim();
    }

    // 3) Decide user turn text
    const userTurn = (userText || transcript || '').trim();
    if (userTurn) {
      messages.push({
        role: 'user',
        content:
          (audioUrl ? `(voice message at ${audioUrl}) ` : '') +
          userTurn,
      });
    } else if (!history?.length) {
      // First load: ask an opening question
      messages.push({ role: 'assistant', content: "Let's practice Speaking Part 1. What's your full name?" });
      return res.status(200).json({ reply: "Let's practice Speaking Part 1. What's your full name?" });
    } else {
      // Nothing to respond to; avoid echo loop
      return res.status(400).json({ error: 'No input provided' });
    }

    // 4) Call Groq chat (Llama 3.3 70B)
    const chat = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 300,
        messages,
      }),
    });
    const j = await chat.json();
    if (!chat.ok) throw new Error(j?.error?.message || 'LLM error');

    const reply = String(j?.choices?.[0]?.message?.content || '').trim() || 'Okay—tell me more.';
    return res.status(200).json({ reply, transcript: transcript || undefined });
  } catch (e: any) {
    return res.status(500).json({ error: nice(e) });
  }
}
