import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { generateAIPlan } from '@/lib/aiPlan';
import type { Profile, AIPlan } from '@/types/profile';

export default function PlanPage() {
  const [plan, setPlan] = useState<AIPlan | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabaseBrowser
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) {
        setPlan(generateAIPlan(data as Profile));
      }
    })();
  }, []);

  return (
    <section className="py-24 bg-lightBg dark:bg-dark/80">
      <Container>
        <Card className="p-6 rounded-ds-2xl max-w-xl mx-auto">
          <h1 className="font-slab text-display mb-4">Personalized Study Plan</h1>
          {plan ? (
            <ol className="list-decimal pl-6 space-y-2">
              {plan.sequence.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          ) : (
            <div>Loading…</div>
          )}
        </Card>
      </Container>
    </section>
  );
}
