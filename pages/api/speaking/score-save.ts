// pages/api/speaking/score-save.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserServer } from '@/lib/authServer';
import { randomPrompts } from '@/lib/speaking/promptBank';

export const config = { api: { bodyParser: true, sizeLimit: '26mb' } };

type Body = {
  audioBase64: string;
  mime?: string;
  part: 'p1' | 'p2' | 'p3';
  attemptId?: string;
  durationSec?: number;
  clipBytes?: number;
};

const MAX_BYTES = Number(process.env.SPEAKING_MAX_BYTES || 25 * 1024 * 1024);

function sanitizeText(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(s: string) {
  return sanitizeText(s).split(' ').filter(Boolean).length;
}

// crude overlap (Jaccard on unigrams)
function jaccard(a: string, b: string) {
  const A = new Set(sanitizeText(a).split(' ').filter(Boolean));
  const B = new Set(sanitizeText(b).split(' ').filter(Boolean));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

function clampBand(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(9, Math.round(n * 10) / 10));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, supabase } = await getUserServer(req, res);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    audioBase64,
    mime = 'audio/webm',
    part,
    attemptId,
    durationSec = null,
    clipBytes = 0,
  } = (req.body || {}) as Body;

  if (!audioBase64 || !part || !['p1', 'p2', 'p3'].includes(part)) {
    return res.status(400).json({ error: 'audioBase64 and valid part (p1|p2|p3) required' });
  }

  const buf = Buffer.from(audioBase64, 'base64');
  if (buf.byteLength > MAX_BYTES) {
    return res.status(413).json({ error: 'Audio too large' });
  }

  // 1) Ensure attempt exists
  let useAttemptId = attemptId?.trim();
  if (useAttemptId) {
    const { data, error } = await supabase.from('speaking_attempts').select('id').eq('id', useAttemptId).single();
    if (error || !data) return res.status(404).json({ error: 'Attempt not found' });
  } else {
    const prompts = randomPrompts();
    const { data, error } = await supabase
      .from('speaking_attempts')
      .insert({ user_id: user.id, prompts, parts: prompts }) // parts for legacy NOT NULL
      .select('id')
      .single();
    if (error || !data) return res.status(500).json({ error: 'Could not create attempt' });
    useAttemptId = data.id;
  }

  // 2) Store audio in private bucket
  const ext = mime.includes('wav') ? 'wav' : mime.includes('mpeg') || mime.includes('mp3') ? 'mp3' : 'webm';
  const key = `${user.id}/${useAttemptId}/${part}-${Date.now()}.${ext}`;
  const up = await supabase.storage.from('speaking-clips').upload(key, buf, { contentType: mime, upsert: false });
  if (up.error) return res.status(500).json({ error: `Upload failed: ${up.error.message}` });

  // 3) Transcribe with Groq Whisper
  const GROQ = process.env.GROQ_API_KEY;
  if (!GROQ) return res.status(500).json({ error: 'Server missing GROQ_API_KEY' });

  // Build multipart for STT
  const blob = new Blob([buf], { type: mime });
  const fd = new FormData();
  fd.append('file', blob, `audio.${ext}`);
  fd.append('model', 'whisper-large-v3-turbo');
  const stt = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ}` },
    body: fd,
  });
  const sttJson = await stt.json();
  if (!stt.ok) return res.status(stt.status).json({ error: sttJson?.error?.message || 'Transcription failed' });
  const transcript: string = String(sttJson.text || '').trim();

  // 4) Fetch prompt used for this part
  const { data: attemptRow } = await supabase
    .from('speaking_attempts')
    .select('prompts, parts')
    .eq('id', useAttemptId)
    .single();
  const prompt: string =
    (attemptRow?.prompts && attemptRow.prompts[part]) ||
    (attemptRow?.parts && attemptRow.parts[part]) ||
    '';

  // 5) Score with Groq Llama 3.3 70B (return JSON only)
  const promptMsg =
    `You are an IELTS Speaking examiner. Score strictly on official criteria.\n` +
    `Return ONLY compact JSON with fields: ` +
    `{"fluency":0-9,"lexical":0-9,"grammar":0-9,"pronunciation":0-9,"overall":0-9,"feedback":"1-2 sentences"}.\n` +
    `Do not wrap in markdown.`;

  const userMsg =
    `Part: ${part}\nPrompt: ${prompt}\nTranscript: ${transcript}\n` +
    `Rules: penalize if the candidate repeats the prompt, gives very short answers, or reads memorized templates.`;

  const gradeRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        { role: 'system', content: promptMsg },
        { role: 'user', content: userMsg },
      ],
    }),
  });
  const gradeJson = await gradeRes.json();
  if (!gradeRes.ok) return res.status(gradeRes.status).json({ error: gradeJson?.error?.message || 'Scoring failed' });

  let content = String(gradeJson?.choices?.[0]?.message?.content || '{}').trim();
  // tolerate accidental code fences
  content = content.replace(/```json|```/g, '').trim();

  let raw: any;
  try { raw = JSON.parse(content); } catch { raw = {}; }

  // 6) Server-side penalties (stop giving 6.0 for parroting/short answers)
  const wc = wordCount(transcript);
  const overlap = jaccard(prompt || '', transcript || '');

  function adj(n: any) { return clampBand(Number(n ?? 0)); }
  let scores = {
    fluency: adj(raw.fluency),
    lexical: adj(raw.lexical),
    grammar: adj(raw.grammar),
    pronunciation: adj(raw.pronunciation),
    overall: adj(raw.overall || (adj(raw.fluency) + adj(raw.lexical) + adj(raw.grammar) + adj(raw.pronunciation)) / 4),
    feedback: String(raw.feedback || '').slice(0, 400),
  };

  // Very short → cap to 4.0 and nudge subs down
  if (wc < 25) {
    scores = {
      ...scores,
      fluency: Math.min(scores.fluency, 4),
      lexical: Math.min(scores.lexical, 4),
      grammar: Math.min(scores.grammar, 4),
      pronunciation: Math.min(scores.pronunciation, 4.5),
      overall: Math.min(scores.overall, 4),
      feedback: (scores.feedback || 'Answer too short; extend answers and develop ideas.'),
    };
  }

  // High prompt echo → strong penalty
  if (overlap >= 0.6) {
    scores = {
      ...scores,
      fluency: Math.max(0, scores.fluency - 1),
      lexical: Math.max(0, scores.lexical - 1),
      grammar: Math.max(0, scores.grammar - 1),
      pronunciation: Math.max(0, scores.pronunciation - 0.5),
      overall: Math.min(scores.overall, 4.5),
      feedback: (scores.feedback || '') + ' Avoid repeating the question; answer in your own words.'
    };
  }

  // 7) Insert clip row
  const { error: insErr } = await supabase.from('speaking_clips').insert({
    attempt_id: useAttemptId,
    part,
    prompt: prompt || null,
    transcript: transcript || null,
    duration_sec: durationSec,
    clip_bytes: clipBytes || buf.byteLength,
    audio_url: key,
    fluency: scores.fluency,
    lexical: scores.lexical,
    grammar: scores.grammar,
    pronunciation: scores.pronunciation,
    overall: scores.overall,
    feedback: scores.feedback,
  });
  if (insErr) return res.status(500).json({ error: `DB insert failed: ${insErr.message}` });

  return res.status(200).json({
    attemptId: useAttemptId,
    transcript,
    audio_url: key,
    scores,
  });
}
