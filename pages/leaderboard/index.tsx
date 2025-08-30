import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Entry {
  user_id: string;
  full_name: string | null;
  score: number;
}

export default function WeeklyLeaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const table = period === 'weekly' ? 'weekly_leaderboard' : 'monthly_leaderboard';
      const { data, error } = await supabase
        .from(table)
        .select('user_id, score, user_profiles(full_name)')
        .order('score', { ascending: false })
        .limit(10);
      if (!error && data) {
        const formatted: Entry[] = data.map((d: any) => ({
          user_id: d.user_id,
          score: d.score,
          full_name: d.user_profiles?.full_name ?? 'Anonymous',
        }));
        setEntries(formatted);
      }
      setLoading(false);
    })();
  }, [period]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-6 rounded-ds-2xl max-w-xl mx-auto">
          <h1 className="font-slab text-display mb-4 capitalize">{period} Leaderboard</h1>
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={period === 'weekly' ? 'primary' : 'secondary'}
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </Button>
            <Button
              size="sm"
              variant={period === 'monthly' ? 'primary' : 'secondary'}
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
          </div>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <ol className="space-y-2">
              {entries.map((e, i) => (
                <li key={e.user_id} className="flex justify-between">
                  <span>
                    {i + 1}. {e.full_name}
                  </span>
                  <span className="font-semibold">{e.score}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </Container>
    </section>
  );
}
