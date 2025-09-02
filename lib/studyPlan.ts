// lib/studyPlan.ts
import { StudyPlan, StudyDay, StudyTask, TaskType } from '@/types/plan';
import { env } from './env';

export type PlanGenOptions = {
  userId: string;
  startISO?: string;     // defaults to today 00:00Z
  weeks?: number;        // default 4
  goalBand?: number;     // 4..9
  weaknesses?: string[]; // e.g., ['listening:map', 'reading:tfng']
};

const MODULES: TaskType[] = ['listening', 'reading', 'writing', 'speaking'];

function startOfDayISO(d = new Date()) {
  const z = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return z.toISOString();
}

function mkTask(partial: Partial<StudyTask> & Pick<StudyTask, 'type' | 'title'>): StudyTask {
  return {
    id: crypto.randomUUID(),
    estMinutes: partial.estMinutes ?? defaultMinutes(partial.type),
    completed: false,
    ...partial,
  } as StudyTask;
}

function defaultMinutes(t: TaskType) {
  if (t === 'mock') return 60;
  if (t === 'review') return 30;
  if (t === 'writing' || t === 'speaking') return 40;
  return 25;
}

function planForDay(dateISO: string, dayIndex: number, weaknesses?: string[]): StudyDay {
  // Simple rotation with one heavier focus; sprinkle review/vocab.
  const mod = MODULES[dayIndex % MODULES.length];

  const tasks: StudyTask[] = [
    mkTask({ type: mod, title: `Practice: ${capitalize(mod)}` }),
    mkTask({ type: 'review', title: 'Review yesterday’s mistakes', estMinutes: 20 }),
    mkTask({ type: 'vocab', title: 'Vocabulary builder', estMinutes: 15 }),
  ];

  // Every 3rd day add writing/speaking alternate
  if (dayIndex % 3 === 2) {
    tasks.push(mkTask({ type: 'writing', title: 'Writing drill (Task 2 outline)', estMinutes: 35 }));
  } else if (dayIndex % 3 === 1) {
    tasks.push(mkTask({ type: 'speaking', title: 'Speaking prompts (2 x 2min)', estMinutes: 20 }));
  }

  // Weakness-driven extra task (lightweight)
  const weak = (weaknesses || [])[dayIndex % Math.max(1, (weaknesses || []).length)];
  if (weak) tasks.push(mkTask({ type: 'review', title: `Targeted drill: ${weak}`, estMinutes: 15 }));

  return { dateISO, tasks };
}

export function generateStudyPlan(opts: PlanGenOptions): StudyPlan {
  const start = opts.startISO || startOfDayISO();
  const weeks = Math.min(Math.max(opts.weeks ?? 4, 1), 12);
  const days: StudyDay[] = [];

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + idx);
      days.push(planForDay(date.toISOString(), idx, opts.weaknesses));
    }
  }

  return {
    userId: opts.userId,
    startISO: start,
    weeks,
    goalBand: opts.goalBand,
    weaknesses: opts.weaknesses,
    days,
  };
}

/** Mark task done (in-memory helper; persist separately). */
export function markTaskComplete(sp: StudyPlan, dateISO: string, taskId: string): StudyPlan {
  const days = sp.days.map((d) =>
    d.dateISO.slice(0, 10) === dateISO.slice(0, 10)
      ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)) }
      : d,
  );
  return { ...sp, days };
}

/** Persist via API (preferred). Falls back to direct Supabase if API unavailable. */
export async function upsertStudyPlan(sp: StudyPlan): Promise<{ ok: true } | { ok: false; error: string }> {
  const base =
    typeof window === 'undefined'
      ? env.SITE_URL || env.NEXT_PUBLIC_BASE_URL || ''
      : '';

  try {
    // Use onboarding complete endpoint if present (it persists profile + plan)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const { supabaseBrowser } = await import('@/lib/supabaseBrowser');
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch { /* no-op */ }

    const r = await fetch(`${base}/api/onboarding/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan_json: sp }),
    });

    if (r.ok) return { ok: true };
  } catch {
    // fall through
  }

  // Fallback: write directly
  try {
    const { supabaseBrowser } = await import('@/lib/supabaseBrowser');
    const sb = supabaseBrowser;
    const { error } = await sb.from('study_plans').upsert(
      {
        user_id: sp.userId,
        plan_json: sp,
        start_iso: sp.startISO,
        weeks: sp.weeks,
        goal_band: sp.goalBand,
      },
      { onConflict: 'user_id' },
    );
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'persist_failed' };
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
