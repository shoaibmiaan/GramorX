import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const BodySchema = z.object({
  examType: z.enum(['Academic','General Training']),
  goalBand: z.number().min(4).max(9),
  locale: z.enum(['en','ur']),
  examDate: z.string().optional(), // ISO date
  skills: z.object({
    listening: z.number().optional(),
    reading: z.number().optional(),
    writing: z.number().optional(),
    speaking: z.number().optional(),
    weaknesses: z.array(z.string()).optional(),
  }).optional(),
  schedule: z.object({
    days: z.array(z.enum(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])).min(1),
    minutesPerDay: z.number().min(15).max(180),
  }),
});

type Resp = { ok: true } | { ok: false; error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ ok: false, error: parse.error.issues.map(i => i.message).join(', ') });
  const body = parse.data;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(503).json({ ok: false, error: 'Supabase env missing' });

  // Authenticate the caller (user) via Authorization bearer token
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false, error: 'Missing Authorization bearer token' });

  const supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user?.id) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const userId = userRes.user.id;

  // 1) Update profile
  const { error: pErr } = await supabase.from('profiles').update({
    exam_type: body.examType,
    goal_band: body.goalBand,
    locale: body.locale,
  }).eq('id', userId);
  if (pErr) return res.status(500).json({ ok: false, error: pErr.message });

  // 2) Generate plan (4 weeks from today OR until examDate, whichever is sooner)
  const today = new Date();
  const exam = body.examDate ? new Date(body.examDate + 'T00:00:00') : addDays(today, 28);
  const fourWeeks = addDays(today, 28);
  const end = exam.getTime() < fourWeeks.getTime() ? exam : fourWeeks;

  const plan = generatePlan(today, end, body.schedule.days, body.schedule.minutesPerDay);

  const { error: sErr } = await supabase.from('study_plans').upsert(
    {
      user_id: userId,
      start_date: iso(today),
      end_date: iso(end),
      plan_json: plan as unknown as Record<string, unknown>,
      is_active: true,
    },
    { onConflict: 'user_id' }
  );
  if (sErr) return res.status(500).json({ ok: false, error: sErr.message });

  // 3) Save skills (if table exists)
  if (body.skills) {
    try {
      await supabase.from('skill_snapshots').insert({
        user_id: userId,
        listening: body.skills.listening ?? null,
        reading: body.skills.reading ?? null,
        writing: body.skills.writing ?? null,
        speaking: body.skills.speaking ?? null,
        weaknesses: body.skills.weaknesses ?? [],
        created_at: new Date().toISOString(),
      } as any);
    } catch {
      // ignore if table missing
    }
  }

  return res.status(200).json({ ok: true });
}

/* --- helpers --- */
type Module = 'listening' | 'reading' | 'writing' | 'speaking';
type StudyTask = { module: Module; minutes: number };
type PlanDay = { date: string; tasks: StudyTask[] };
type StudyPlan = { days: PlanDay[] };

function generatePlan(start: Date, end: Date, weekdays: readonly string[], minutesPerDay: number): StudyPlan {
  const days: PlanDay[] = [];
  const modules: Module[] = ['listening','reading','writing','speaking'];
  let i = 0;
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    const wd = mapToMonSun(d.getDay()); // 0..6 -> Mon..Sun
    const wdName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][wd];
    if (weekdays.includes(wdName)) {
      days.push({ date: iso(d), tasks: [{ module: modules[i % modules.length], minutes: minutesPerDay }] });
      i++;
    }
  }
  return { days };
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const mapToMonSun = (jsDay: number) => (jsDay + 6) % 7; // Sun(0)->6, Mon(1)->0 ...
