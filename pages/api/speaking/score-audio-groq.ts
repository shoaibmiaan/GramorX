import { env } from "@/lib/env";
// pages/api/speaking/score-audio-groq.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';
import type { GroqTranscription } from '@/types/groq';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
};

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const ScoreSchema = z.object({
  fluency: z.number().min(0).max(9),
  lexical: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
  pronunciation: z.number().min(0).max(9),
  overall: z.number().min(0).max(9),
  feedback: z.string().min(4).max(800),
});

const ReqSchema = z.object({
  audioBase64: z.string().min(10).optional(),        // base64 WITHOUT 'data:' prefix
  fileUrl: z.string().url().optional(),              // or a fetchable URL
  mime: z.string().default('audio/webm'),
  part: z.enum(['p1','p2','p3']).optional(),
  promptHint: z.string().optional(),
  durationSec: z.number().optional(),
}).refine((d) => !!d.audioBase64 || !!d.fileUrl, { message: 'Provide audioBase64 or fileUrl' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });

  try {
    const parsed = ReqSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad request', issues: parsed.error.issues });

    let { audioBase64, fileUrl, mime, part, promptHint } = parsed.data;

    // Acquire audio buffer
    let buf: Buffer;
    if (fileUrl) {
      const resp = await fetch(fileUrl);
      if (!resp.ok) return res.status(400).json({ error: `Unable to fetch fileUrl (${resp.status})` });
      const ab = await resp.arrayBuffer();
      buf = Buffer.from(ab);
      const ct = resp.headers.get('content-type');
      if (ct) mime = ct;
    } else {
      buf = Buffer.from(String(audioBase64), 'base64');
    }

    // Temp file
    const ext = mime.includes('mpeg') ? 'mp3' : mime.includes('wav') ? 'wav' : 'webm';
    const tmpFile = path.join(os.tmpdir(), `speaking-${Date.now()}.${ext}`);
    fs.writeFileSync(tmpFile, buf);

    // Transcribe (Groq Whisper)
    const transcription: GroqTranscription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-large-v3',
      // language: 'en',
      prompt: promptHint ?? undefined,
      response_format: 'json',
    });

    const transcript: string =
      transcription.text || transcription.segments?.map((s) => s.text).join(' ').trim() || '';

    // Score (Llama 3.3 70B)
    const systemPrompt = `
You are an IELTS Speaking examiner. Score strictly with the official descriptors:

Criteria
1) Fluency & Coherence
2) Lexical Resource
3) Grammatical Range & Accuracy
4) Pronunciation

Rules
- Return JSON ONLY, no prose.
- Give band (0–9) for each criterion.
- "overall" = average of the four, rounded to nearest 0.5.
- "feedback" = 2–3 sentences with concrete improvements (actionable, concise).
- Assume this is part ${part ?? 'unknown'}.
- JSON shape:
{
  "fluency": number,
  "lexical": number,
  "grammar": number,
  "pronunciation": number,
  "overall": number,
  "feedback": string
}`.trim();

    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcript:\n${transcript}\n\nReturn JSON only.` },
      ],
      temperature: 0.2,
    });

    const raw = chat?.choices?.[0]?.message?.content?.trim() ?? '';
    let scored: any = {};
    try { scored = JSON.parse(raw); } catch {}

    const safe = ScoreSchema.safeParse(scored);
    if (!safe.success) {
      return res.status(422).json({ error: 'Invalid score JSON', issues: safe.error.issues, raw });
    }

    return res.status(200).json({
      transcript,
      ...safe.data,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
