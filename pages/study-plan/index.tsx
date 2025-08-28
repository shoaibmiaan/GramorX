import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import TargetSummary from '@/components/study-plan/TargetSummary';
import UpcomingPlan from '@/components/study-plan/UpcomingPlan';
import { analyzePlan, AttemptCount } from '@/lib/studyPlan';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function StudyPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<ReturnType<typeof analyzePlan> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        router.replace('/login');
        return;
      }

      const since = new Date();
      since.setDate(since.getDate() - 14);
      const sinceISO = since.toISOString();

      const [readAll, listenAll, readRecent, listenRecent] = await Promise.all([
        supabaseBrowser
          .from('reading_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
        supabaseBrowser
          .from('listening_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
        supabaseBrowser
          .from('reading_attempts')
          .select('created_at')
          .eq('user_id', uid)
          .gte('created_at', sinceISO),
        supabaseBrowser
          .from('listening_attempts')
          .select('created_at')
          .eq('user_id', uid)
          .gte('created_at', sinceISO),
      ]);

      if (!active) return;

      const totalAttempts = (readAll.count ?? 0) + (listenAll.count ?? 0);
      const attempts = [
        ...((readRecent.data as { created_at: string }[]) || []),
        ...((listenRecent.data as { created_at: string }[]) || []),
      ];

      const counts: Record<string, number> = {};
      attempts.forEach((a) => {
        const key = a.created_at.slice(0, 10);
        counts[key] = (counts[key] ?? 0) + 1;
      });

      const history: AttemptCount[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        history.push({ date: key, count: counts[key] ?? 0 });
      }

      const result = analyzePlan(history, 2, 100, totalAttempts);
      setPlan(result);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-display text-gradient-primary mb-6">Study Plan</h1>
        {loading && <p>Loading...</p>}
        {!loading && plan && (
          <div className="grid gap-6 md:grid-cols-2">
            <TargetSummary
              daily={plan.dailyTarget}
              weekly={plan.weeklyTarget}
              eta={plan.eta}
            />
            <UpcomingPlan days={plan.next7} />
          </div>
        )}
      </Container>
    </section>
  );
}
