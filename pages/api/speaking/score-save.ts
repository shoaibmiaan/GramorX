import type { NextApiRequest, NextApiResponse } from 'next';
import {
  evaluateWithGemini,
  evaluateWithGroq,
  transcribeWithGroq,
  fallbackFeedback,
} from '@/lib/ai/evaluateSpeaking';

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { attemptId, part, audioBase64, mime, path, clipId } = req.body || {};
    if (!attemptId || !part || !audioBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // --- Transcribe audio (Groq Whisper) ---
    let transcript: string | null = null;
    try {
      const buf = Buffer.from(String(audioBase64), 'base64');
      const ext = mime?.split('/')[1] || 'webm';
      transcript = await transcribeWithGroq(buf, `clip.${ext}`);
    } catch (err) {
      console.error('transcription failed', err);
    }

    // --- Evaluate with available AI service ---
    const evalInput = { transcript: transcript || undefined, ctx: part as 'p1' | 'p2' | 'p3' | 'chat' };
    let feedback = await evaluateWithGemini(evalInput);
    if (!feedback) feedback = await evaluateWithGroq(evalInput);
    if (!feedback) feedback = fallbackFeedback();

    const advice = feedback.summary || 'Great effort—keep practicing!';

    return res.status(200).json({ ok: true, advice, attemptId, path, clipId, mime });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
