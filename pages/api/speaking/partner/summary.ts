import { env } from "@/lib/env";
// pages/api/speaking/partner/summary.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import Groq from 'groq-sdk';

export const config = { api: { bodyParser: true, sizeLimit: '1mb' } };

type Ok = {
  attemptId: string;
  cached: boolean;
  summary: PartnerSummary;
};
type Err = { error: string };

type PartnerSummary = {
  overall: number;
  fluency: number;
  lexical: number;
  grammar: number;
  pronunciation: number;
  feedback: string;
  positives: string[];
  mistakes: string[];
  actions: string[];
  word_count?: number;
};

const clamp = (n: any, lo = 1, hi = 9) => {
  const x = Number(n);
  if (Number.isNaN(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { attemptId, force } = req.body as { attemptId?: string; force?: boolean };
    if (!attemptId) return res.status(400).json({ error: 'Missing attemptId' });

    const supabase = createPagesServerClient({ req, res });
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // Fetch attempt (ensure owner)
    const { data: attempt, error: aerr } = await supabase
      .from('speaking_attempts')
      .select('id, user_id, transcript, chat_log, partner_summary')
      .eq('id', attemptId)
      .single();
    if (aerr || !attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.user_id !== user.id) return res.status(403).json({ error: 'Forbidden' });

    // If cached and not forcing, return immediately
    if (!force && attempt.partner_summary) {
      return res.status(200).json({
        attemptId,
        cached: true,
        summary: attempt.partner_summary as PartnerSummary,
      });
    }

    // Build transcript text (fall back to chat_log)
    let transcript = (attempt.transcript as string | null) || '';
    if (!transcript || transcript.trim().length < 10) {
      const chat = attempt.chat_log as { role: 'bot' | 'user'; text: string }[] | null;
      if (chat?.length) {
        transcript = chat.map(m => `${m.role === 'bot' ? 'Partner' : 'You'}: ${m.text}`).join('\n');
      }
    }
    transcript = (transcript || '').trim();
    if (!transcript) return res.status(400).json({ error: 'No transcript available to summarize' });

    const wc = transcript.split(/\s+/).filter(Boolean).length;

    // Call Groq (OpenAI-compatible)
    const groq = new Groq({ apiKey: env.GROQ_API_KEY });
    const model = env.GROQ_MODEL || 'llama-3.1-8b-instant';

    const sys =
      'You are an IELTS Speaking examiner. Evaluate the USER transcript ONLY. ' +
      'Return STRICT JSON with keys: overall, fluency, lexical, grammar, pronunciation, ' +
      'feedback, positives[], mistakes[], actions[]. Scores must be 1-9 (may be decimals). ' +
      'Be concise but specific. No extra text outside JSON.';

    const userMsg =
      `USER TRANSCRIPT (approx ${wc} words):\n` +
      transcript +
      `\n\n` +
      'Score against IELTS Speaking band descriptors. ' +
      'Make feedback supportive and actionable. Use British spelling.';

    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userMsg },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'Model returned non-JSON' });
    }

    const summary: PartnerSummary = {
      overall: clamp(parsed.overall),
      fluency: clamp(parsed.fluency),
      lexical: clamp(parsed.lexical),
      grammar: clamp(parsed.grammar),
      pronunciation: clamp(parsed.pronunciation),
      feedback: String(parsed.feedback || '').slice(0, 3000),
      positives: Array.isArray(parsed.positives) ? parsed.positives.slice(0, 10) : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes.slice(0, 10) : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 10) : [],
      word_count: wc,
    };

    // If model forgot overall, compute average
    if (!summary.overall || Number.isNaN(summary.overall)) {
      const avg = (summary.fluency + summary.lexical + summary.grammar + summary.pronunciation) / 4;
      summary.overall = Math.round(avg * 10) / 10;
    }

    // Persist cache
    const { error: uerr } = await supabase
      .from('speaking_attempts')
      .update({ partner_summary: summary, overall_band: summary.overall })
      .eq('id', attemptId);
    if (uerr) return res.status(500).json({ error: uerr.message });

    return res.status(200).json({ attemptId, cached: false, summary });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}
