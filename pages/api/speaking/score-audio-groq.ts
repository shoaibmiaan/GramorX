// pages/api/speaking/score-audio-groq.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } }, // plenty for short speaking parts
};


const ScoreSchema = z.object({
  fluency: z.number().min(0).max(9),
  lexical: z.number().min(0).max(9),
  grammar: z.number().min(0).max(9),
  pronunciation: z.number().min(0).max(9),
  overall: z.number().min(0).max(9),
  feedback: z.string().min(4).max(800),
});

const ReqSchema = z.object({
  audioBase64: z.string().min(10),               // data without the data: prefix
  mime: z.string().default('audio/webm'),        // e.g., 'audio/webm' or 'audio/mpeg'
  part: z.enum(['p1','p2','p3']).optional(),
  promptHint: z.string().optional(),             // optional context for Whisper
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY missing' });

  try {
    const parsed = ReqSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Bad request', issues: parsed.error.issues });

    const { audioBase64, mime, part, promptHint } = parsed.data;

    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

    // 1) write temp file (Groq SDK accepts file streams)
    const buf = Buffer.from(audioBase64, 'base64');
    const ext = mime.includes('mpeg') ? 'mp3' : mime.includes('wav') ? 'wav' : 'webm';
    const tmpFile = path.join(os.tmpdir(), `speaking-${Date.now()}.${ext}`);
    fs.writeFileSync(tmpFile, buf);

    // 2) Transcribe with Whisper (Groq)
    // Model name per Groq docs: "whisper-large-v3"
    // https://console.groq.com/docs/speech-to-text
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile) as any,
      model: 'whisper-large-v3',
      // language: 'en',                  // optional: force EN
      // temperature: 0,                  // optional
      prompt: promptHint ?? undefined,    // optional hint, if you pass topic/keywords
      response_format: 'json',
    });

    // Clean temp file
    try { fs.unlinkSync(tmpFile); } catch {}

    const transcript: string = (transcription as any)?.text ?? (transcription as any)?.transcript ?? '';

    if (!transcript || transcript.trim().length < 2) {
      return res.status(422).json({ error: 'Empty/invalid transcript from STT' });
    }

    // 3) Score with Llama 3.3 70B (Groq chat.completions)
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
}
`.trim();

    const chat = await groq.chat.completions.create({
      // Current recommended high-quality model
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
    });

    const raw = chat.choices?.[0]?.message?.content ?? '';
    let scored: any = null;

    try {
      scored = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) scored = JSON.parse(m[0]);
    }

    if (!scored) return res.status(502).json({ error: 'Model did not return JSON', raw });

    // compute/repair overall if missing; round to nearest 0.5
    const toNum = (v: any) => (typeof v === 'number' ? v : Number(v));
    const f = toNum(scored.fluency), l = toNum(scored.lexical), g = toNum(scored.grammar), p = toNum(scored.pronunciation);
    if (!isFinite(scored.overall)) {
      const avg = (f + l + g + p) / 4;
      scored.overall = Math.round(avg * 2) / 2;
    }

    const safe = ScoreSchema.safeParse(scored);
    if (!safe.success) {
      return res.status(422).json({ error: 'Invalid score JSON', issues: safe.error.issues, raw });
    }

    return res.status(200).json({
      transcript,
      scores: safe.data,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? 'Server error' });
  }
}
