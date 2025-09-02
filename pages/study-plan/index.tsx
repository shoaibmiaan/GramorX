import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type Module = 'listening' | 'reading' | 'writing' | 'speaking';
type Task = { module: Module; minutes: number };
type PlanDay = { date: string; tasks: Task[] };
type StudyPlan = { start_date?: string; end_date?: string; plan_json?: { days: PlanDay[] } };

const Shell: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        {right}
      </header>
      <div className="rounded-2xl border border-border bg-background/50 p-5 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return setLoading(false);
        const { data } = await supabase.from('study_plans').select('*').eq('user_id', user.id).single();
        setPlan((data as unknown as StudyPlan) || null);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const days = useMemo<PlanDay[]>(() => {
    const all = plan?.plan_json?.days ?? [];
    // show next 7 days starting today
    const todayISO = new Date().toISOString().slice(0, 10);
    const idx = all.findIndex((d) => d.date >= todayISO);
    const start = Math.max(0, idx);
    return all.slice(start, start + 7);
  }, [plan]);

  const none = !loading && (!plan || !plan.plan_json?.days?.length);

  return (
    <Shell
      title="Your Study Plan"
      right={<Link href="/progress" className="text-sm underline underline-offset-4">Progress</Link>}
    >
      {loading ? (
        <div className="rounded-xl border border-border p-4 text-sm text-foreground/70">Loading your plan…</div>
      ) : none ? (
        <div className="grid gap-3">
          <div className="rounded-xl border border-border p-4 text-sm">
            No active plan found. Complete <Link href="/onboarding/goal" className="underline underline-offset-4">Onboarding</Link> to generate a plan.
          </div>
          <div className="flex justify-end">
            <Link href="/onboarding/goal" className="rounded-xl bg-primary px-4 py-2 font-medium text-background hover:opacity-90">Start onboarding</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((d) => (
            <article key={d.date} className="rounded-xl border border-border p-4">
              <div className="mb-2 text-sm font-medium">{formatHuman(d.date)}</div>
              <ul className="text-sm text-foreground/80">
                {d.tasks.map((t, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="capitalize">{t.module}</span>
                    <span className="text-foreground/70">{t.minutes} min</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                {d.tasks.some(t => t.module === 'listening') && <Link href="/listening" className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Listening</Link>}
                {d.tasks.some(t => t.module === 'reading')   && <Link href="/reading" className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Reading</Link>}
                {d.tasks.some(t => t.module === 'writing')   && <Link href="/writing" className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Writing</Link>}
                {d.tasks.some(t => t.module === 'speaking')  && <Link href="/speaking/simulator" className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary">Speaking</Link>}
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}

function formatHuman(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
