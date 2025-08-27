import { env } from "@/lib/env";
// pages/api/ai/profile-suggest.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { LEVELS, PREFS, TIME } from '@/lib/profile-options';

type EnglishLevel = typeof LEVELS[number];
type StudyPref = typeof PREFS[number];
type TimeCommitment = typeof TIME[number];

type Payload = {
  english_level: EnglishLevel;
  study_prefs?: StudyPref[];
  time_commitment?: TimeCommitment;
  current_band?: number; // if known from diagnostics
};

export const levelGoalMap: Record<EnglishLevel, number> = {
  Beginner: 5.5,
  Elementary: 6.0,
  'Pre-Intermediate': 6.5,
  Intermediate: 7.0,
  'Upper-Intermediate': 7.5,
  Advanced: 8.0,
};

export const timeMultiplierMap: Record<TimeCommitment, number> = {
  '1h/day': 6,
  '2h/day': 4,
  Flexible: 5,
};

const localHeuristic = (p: Payload) => {
  const suggestedGoal = Math.max(
    4,
    Math.min(9, levelGoalMap[p.english_level] + (p.time_commitment === '2h/day' ? 0.5 : 0))
  );

  const prefs = p.study_prefs?.length ? p.study_prefs : [...PREFS];

  const etaWeeks = Math.max(
    4,
    Math.round((suggestedGoal - 5) * timeMultiplierMap[p.time_commitment ?? 'Flexible'])
  );

  const notes = [
    `Focus order: ${prefs.join(' → ')}`,
    `Consistency > intensity. Aim for ${p.time_commitment ?? '1–2h/day'}.`,
    `Benchmark every 2 weeks; adjust goal if you're +0.5 ahead.`,
  ];

  return {
    suggestedGoal: Number(suggestedGoal.toFixed(1)),
    etaWeeks,
    sequence: prefs,
    notes,
    source: 'local',
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const payload: Payload = req.body;
  if (!payload?.english_level) {
    return res.status(400).json({ error: 'english_level is required' });
  }

  const key = env.OPENAI_API_KEY;
  if (!key) {
    return res.status(200).json(localHeuristic(payload));
  }

  try {
    // Lazy import to avoid bundling if not used
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: key });

    const sys = `You are an IELTS study coach.
Return JSON only with keys: suggestedGoal (number), etaWeeks (number), sequence (array of 4 strings from Listening/Reading/Writing/Speaking), notes (array of 3 short strings).
Goal must be between 4.0 and 9.0 in 0.5 steps.`;

    const user = `Profile:
- Level: ${payload.english_level}
- Time: ${payload.time_commitment ?? 'unspecified'}
- Preferences: ${(payload.study_prefs ?? []).join(', ') || 'unspecified'}
- Current Band: ${payload.current_band ?? 'unknown'}
Return the plan.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      // If the model returns text, try to extract JSON block
      const match = raw.match(/\{[\s\S]*\}$/);
      data = match ? JSON.parse(match[0]) : null;
    }

    if (!data) return res.status(200).json(localHeuristic(payload));

    data.suggestedGoal = Number(Math.min(9, Math.max(4, data.suggestedGoal)).toFixed(1));
    data.source = 'openai';
    return res.status(200).json(data);
  } catch (err: any) {
    // Safe fallback
    return res.status(200).json(localHeuristic(payload));
  }
}
