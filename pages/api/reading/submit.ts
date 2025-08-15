// pages/api/reading/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Kind = 'tfng' | 'mcq' | 'matching' | 'short';

type DbQuestion = {
  id: string;
  order_no: number;
  kind: Kind;
  prompt: string;
  options: any;
  answers: any;
  points: number | null;
};

const norm = (s: any) =>
  typeof s === 'string' ? s.trim().replace(/\s+/g, ' ').toLowerCase() : s;

const normTF = (s: any): 'true' | 'false' | 'not given' | undefined => {
  const v = norm(s);
  if (v === undefined || v === null) return undefined;
  if (['t', 'true', 'yes', 'y'].includes(String(v))) return 'true';
  if (['f', 'false', 'no', 'n'].includes(String(v))) return 'false';
  // accept variations: "notgiven", "not-given", "not  given"
  if (String(v).replace(/[^a-z]/g, '') === 'notgiven') return 'not given';
  if (v === 'not given') return 'not given';
  // also map canonical labels sometimes used in seed data
  if (v === 'true') return 'true';
  if (v === 'false') return 'false';
  return undefined;
};

function isCorrect(q: DbQuestion, userRaw: any) {
  switch (q.kind) {
    case 'tfng': {
      const expectedRaw = Array.isArray(q.answers) ? q.answers[0] : q.answers;
      const u = normTF(userRaw);
      const e = normTF(expectedRaw);
      return u !== undefined && e !== undefined && u === e;
    }
    case 'mcq': {
      const expected = Array.isArray(q.answers) ? q.answers[0] : q.answers;
      return norm(userRaw) === norm(expected);
    }
    case 'short': {
      const arr = Array.isArray(q.answers) ? q.answers : [];
      const u = norm(userRaw);
      return arr.some((a) => norm(a) === u);
    }
    case 'matching': {
      const exp = Array.isArray(q.answers) ? q.answers : [];
      const uArr = Array.isArray(userRaw) ? userRaw : [];
      if (uArr.length !== exp.length) return false;
      const U = uArr.map(norm);
      const E = exp.map(norm);
      // strict position-wise compare (IELTS matching is position-specific)
      return U.every((u, i) => u === E[i]);
    }
    default:
      return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (req.body || {}) as {
    passageSlug?: string;
    slug?: string;
    answers?: Record<string, any>;
    durationMs?: number;
  };
  const passageSlug = body.passageSlug || body.slug;
  const answers = body.answers;
  const durationMs = typeof body.durationMs === 'number' ? body.durationMs : null;

  if (!passageSlug || !answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    return res.status(500).json({ error: 'Supabase env missing' });
  }

  // --- Read questions (public read via anon key; RLS should allow)
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data: qRows, error: qErr } = await supabase
    .from('reading_questions')
    .select('id,order_no,kind,prompt,options,answers,points')
    .eq('passage_slug', passageSlug)
    .order('order_no', { ascending: true });

  if (qErr) return res.status(500).json({ error: qErr.message });
  const questions: DbQuestion[] = (qRows ?? []) as any[];
  if (!questions.length) return res.status(404).json({ error: 'No questions for passage' });

  // Helper: accept answers keyed by id or by order_no (number or string)
  const getUserAnswer = (q: DbQuestion) =>
    answers[q.id] ??
    answers[q.order_no] ??
    answers[String(q.order_no)];

  // --- Score ---
  let total = 0;
  let correct = 0;
  const byType: Record<Kind, { total: number; correct: number }> = {
    tfng: { total: 0, correct: 0 },
    mcq: { total: 0, correct: 0 },
    matching: { total: 0, correct: 0 },
    short: { total: 0, correct: 0 },
  };

  for (const q of questions) {
    const pts = Number.isFinite(q.points) && (q.points as number) > 0 ? (q.points as number) : 1;
    total += pts;
    byType[q.kind].total += pts;
    if (isCorrect(q, getUserAnswer(q))) {
      correct += pts;
      byType[q.kind].correct += pts;
    }
  }

  const score = { total, correct, byType };

  // --- Optional insert (only if client sends a Supabase user token) ---
  let attemptId: string | null = null;

  // Expect Authorization: Bearer <access_token>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      // Prefer anon client + Authorization header so RLS policies apply
      const authed = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { data: userRes } = await authed.auth.getUser();
      const uid = userRes?.user?.id;

      if (uid) {
        // Try modern schema first: score/max_score/duration_ms/answers
        const tryModern = await authed
          .from('reading_attempts')
          .insert({
            user_id: uid,
            passage_slug: passageSlug,
            answers,
            score: correct,      // points scored
            max_score: total,    // total points
            duration_ms: durationMs,
          })
          .select('id')
          .single();

        if (!tryModern.error && tryModern.data?.id) {
          attemptId = tryModern.data.id;
        } else {
          // Fallback to legacy shape: total/correct/by_type/answers
          const tryLegacy = await authed
            .from('reading_attempts')
            .insert({
              user_id: uid,
              passage_slug: passageSlug,
              total,
              correct,
              by_type: score.byType,
              answers,
              duration_ms: durationMs,
            } as any)
            .select('id')
            .single();

          if (!tryLegacy.error && tryLegacy.data?.id) {
            attemptId = tryLegacy.data.id;
          }
        }
      }
    } catch {
      // swallow insert errors; still return score for smooth UX
      attemptId = null;
    }
  }

  return res.status(200).json({ attemptId, score });
}
