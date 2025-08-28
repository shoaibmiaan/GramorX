import { env } from "@/lib/env";
// pages/api/speaking/score.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import OpenAI from 'openai';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Breakdown = { fluency: number; lexical: number; grammar: number; pronunciation: number };

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { attemptId } = req.body as { attemptId: string };
  if (!attemptId) return res.status(400).json({ error: 'Missing attemptId' });

  const supabase = createSupabaseServerClient({ req });

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Verify ownership & load attempt
  const { data: attempt, error } = await supabaseAdmin
    .from('speaking_attempts')
    .select('id,user_id,audio_urls')
    .eq('id', attemptId)
    .single();

  if (error || !attempt) return res.status(404).json({ error: 'Attempt not found' });
  if (attempt.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

  try {
    // ---- 1. Gather signed URLs for all audio ----
    const audioPaths: string[] = Object.values(attempt.audio_urls || {}).flat() as string[];
    const signedUrls: string[] = [];

    for (const path of audioPaths) {
      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from('speaking-audio')
        .createSignedUrl(path, 300); // 5 min
      if (signErr || !signed?.signedUrl) throw new Error(signErr?.message || 'Unable to sign URL');
      signedUrls.push(signed.signedUrl);
    }

    // ---- 2. Transcribe all audio with Whisper ----
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    let fullTranscript = '';

    for (const audioUrl of signedUrls) {
      const audioResp = await fetch(audioUrl);
      const audioBuffer = Buffer.from(await audioResp.arrayBuffer());

      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
        language: 'en',
      });

      fullTranscript += transcription.text.trim() + '\n';
    }

    fullTranscript = fullTranscript.trim();

    // ---- 3. Score transcript with GPT ----
    const prompt = `
You are an IELTS Speaking examiner. Score the candidate based on the transcript below.
Provide:
- Overall band score (0-9, .5 increments)
- Four criteria: fluency, lexical resource, grammatical range & accuracy, pronunciation
- One short feedback paragraph

Transcript:
"""
${fullTranscript}
"""

Return JSON in this format:
{
  "bandOverall": number,
  "criteria": {
    "fluency": number,
    "lexical": number,
    "grammar": number,
    "pronunciation": number
  },
  "notes": "string"
}
`;

    const gptResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // fast + good for rubric scoring
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });

    const raw = gptResp.choices[0].message?.content || '{}';
    let scoring: { bandOverall: number; criteria: Breakdown; notes: string };
    try {
      scoring = JSON.parse(raw);
    } catch {
      throw new Error('Failed to parse GPT response: ' + raw);
    }

    // ---- 4. Update DB ----
    await supabaseAdmin
      .from('speaking_attempts')
      .update({
        transcript: fullTranscript,
        band_overall: scoring.bandOverall,
        band_breakdown: scoring.criteria,
      })
      .eq('id', attemptId);

    return res.status(200).json({
      attemptId,
      transcript: fullTranscript,
      ...scoring,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
