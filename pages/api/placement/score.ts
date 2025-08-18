// pages/api/placement/score.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// ---------- Types ----------
type Skill = 'listening' | 'reading' | 'writing' | 'speaking';

type ClientPayload = {
  // keep the client schema flexible but typed
  answers: {
    id: string;
    skill: Skill;
    prompt: string;
    options: string[];
    answer: string;      // correct option
    chosen?: string;     // user's option
  }[];
  userId?: string;       // optional user id passthrough
};

type ScoreResult = {
  band: number; // 4..9
  accuracy: number; // 0..1
  correct: number;
  total: number;
  bySkill: Record<Skill, number>;
  guidance: {
    overall: string;
    bySkill: Record<Skill, string>;
  };
};

const SYSTEM_HINT = `
You are an IELTS placement evaluator. Given a very short diagnostic
(6 theory questions across Listening, Reading, Writing, Speaking),
estimate a ROUGH IELTS band (whole number) and give brief, actionable guidance.
Band scale: 4 (limited) → 9 (expert). Be conservative on small samples.
Return ONLY compact JSON in the exact schema requested.
`;

// ---------- Utilities ----------
function safeJsonFromText(text: string) {
  try {
    const s = text.indexOf('{');
    const e = text.lastIndexOf('}');
    if (s === -1 || e === -1) return null;
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

function packCommon(payload: ClientPayload) {
  const total = payload.answers.length;
  const bySkill: Record<Skill, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  };
  let correct = 0;
  for (const a of payload.answers) {
    if (a.chosen === a.answer) {
      correct++;
      bySkill[a.skill] += 1;
    }
  }
  const accuracy = total ? correct / total : 0;
  return { total, correct, accuracy, bySkill };
}

// ---------- Local heuristic fallback ----------
function localHeuristic(payload: ClientPayload): ScoreResult {
  const { total, correct, accuracy, bySkill } = packCommon(payload);
  const band =
    accuracy >= 0.9 ? 8 :
    accuracy >= 0.75 ? 7 :
    accuracy >= 0.6 ? 6 :
    accuracy >= 0.45 ? 5 : 4;

  return {
    band,
    accuracy,
    correct,
    total,
    bySkill,
    guidance: {
      overall: 'Baseline estimate from a short diagnostic. Take a full mock test for precision.',
      bySkill: {
        listening: 'Practice section timing and prediction; refocus quickly if you miss an item.',
        reading: 'Strengthen skimming/scanning and locating supporting evidence.',
        writing: 'Plan logically, use linking devices, and vary sentence structures.',
        speaking: 'Extend answers, paraphrase, and maintain steady fluency.',
      },
    },
  };
}

// ---------- GROQ scorer (preferred if key exists) ----------
async function callGroq(payload: ClientPayload): Promise<ScoreResult | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
  const userData = JSON.stringify(
    payload.answers.map(a => ({
      id: a.id,
      skill: a.skill,
      prompt: a.prompt,
      chosen: a.chosen ?? null,
      correct: a.answer,
    })),
    null,
    2
  );

  const messages = [
    { role: 'system', content: SYSTEM_HINT },
    {
      role: 'user',
      content: `DATA (array of Qs with user's chosen vs correct):

${userData}

Respond ONLY as compact JSON with this exact shape:
{
  "band": <integer 4..9>,
  "overall": "<1-2 short lines>",
  "perSkill": {
    "listening": "<=2 lines>",
    "reading": "<=2 lines>",
    "writing": "<=2 lines>",
    "speaking": "<=2 lines>"
  }
}`,
    },
  ];

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });

  if (!r.ok) throw new Error(`GROQ ${r.status}`);
  const data = await r.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  const parsed = safeJsonFromText(text);
  if (!parsed) return null;

  const { total, correct, accuracy, bySkill } = packCommon(payload);
  const band = Math.max(4, Math.min(9, parseInt(parsed.band ?? 6, 10) || 6));

  return {
    band,
    accuracy,
    correct,
    total,
    bySkill,
    guidance: {
      overall: parsed.overall || 'Take a full diagnostic for a precise band.',
      bySkill: {
        listening: parsed.perSkill?.listening || 'Strengthen timing and prediction.',
        reading: parsed.perSkill?.reading || 'Improve scanning and evidence finding.',
        writing: parsed.perSkill?.writing || 'Plan, organize, and vary grammar/lexis.',
        speaking: parsed.perSkill?.speaking || 'Extend answers and keep steady fluency.',
      },
    },
  };
}

// ---------- Gemini scorer (fallback if GROQ not present) ----------
async function callGemini(payload: ClientPayload): Promise<ScoreResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = 'models/gemini-1.5-flash-latest:generateContent';
  const userText = JSON.stringify(
    payload.answers.map(a => ({
      id: a.id,
      skill: a.skill,
      prompt: a.prompt,
      chosen: a.chosen ?? null,
      correct: a.answer,
    })),
    null,
    2
  );

  const prompt = `
${SYSTEM_HINT}

DATA (array of Qs with user's chosen option and correct option):
${userText}

Respond ONLY as compact JSON with this exact shape:
{
  "band": <integer 4..9>,
  "overall": "<1-2 short lines of guidance>",
  "perSkill": {
    "listening": "<=2 lines>",
    "reading": "<=2 lines>",
    "writing": "<=2 lines>",
    "speaking": "<=2 lines>"
  }
}
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const parsed = safeJsonFromText(text);
  if (!parsed) return null;

  const { total, correct, accuracy, bySkill } = packCommon(payload);
  const band = Math.max(4, Math.min(9, parseInt(parsed.band ?? 6, 10) || 6));

  return {
    band,
    accuracy,
    correct,
    total,
    bySkill,
    guidance: {
      overall: parsed.overall || 'Take a full diagnostic for a precise band.',
      bySkill: {
        listening: parsed.perSkill?.listening || 'Strengthen timing and prediction.',
        reading: parsed.perSkill?.reading || 'Improve scanning and evidence finding.',
        writing: parsed.perSkill?.writing || 'Plan, organize, and vary grammar/lexis.',
        speaking: parsed.perSkill?.speaking || 'Extend answers and keep steady fluency.',
      },
    },
  };
}

// ---------- Persistence (Supabase via service role) ----------
async function persistResult(result: ScoreResult, req: NextApiRequest) {
  // Try dynamic import so this file works even if supabase isn’t set up yet.
  try {
    const mod = await import('@/lib/supabaseAdmin');
    const { supaAdmin } = mod as any;

    const userId =
      (req.headers['x-user-id'] as string) ||
      (req.body?.userId as string) ||
      null;

    // Store as-is; table columns: user_id, accuracy, band, correct, total, by_skill, guidance
    await supaAdmin.from('placement_results').insert({
      user_id: userId,
      accuracy: result.accuracy,
      band: result.band,
      correct: result.correct,
      total: result.total,
      by_skill: result.bySkill,
      guidance: result.guidance,
    });
  } catch (e) {
    // Silently skip if supabase is not configured or insert fails
    console.warn('placement_results: persistence skipped', (e as Error)?.message);
  }
}

// ---------- Handler ----------
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Parse payload
    const payload = req.body as ClientPayload;
    if (!payload?.answers?.length) return res.status(400).json({ error: 'Missing answers' });

    // Score: GROQ → Gemini → heuristic
    let result: ScoreResult | null = null;

    try {
      result = await callGroq(payload);
    } catch (e) {
      console.warn('GROQ scorer failed:', (e as Error)?.message);
    }

    if (!result) {
      try {
        result = await callGemini(payload);
      } catch (e) {
        console.warn('Gemini scorer failed:', (e as Error)?.message);
      }
    }

    if (!result) {
      result = localHeuristic(payload);
    }

    // Persist (best-effort; do not block response if insert fails)
    await persistResult(result, req);

    return res.status(200).json(result);
  } catch (e: any) {
    console.error('placement/score fatal error', e);
    // Last-resort fallback
    return res.status(200).json(localHeuristic((req.body ?? {}) as ClientPayload));
  }
}
