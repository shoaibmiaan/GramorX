import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { getReadingStats, type ReadingStats } from '@/lib/analytics';

export default function ReadingStatsPage() {
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    getReadingStats().then(setStats);
  }, []);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary">Reading Stats</h1>
        {!stats ? (
          <Card className="p-6 mt-6">
            <div className="animate-pulse h-5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
          </Card>
        ) : (
          <Card className="p-6 mt-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="neutral">Attempts: {stats.attempts}</Badge>
              <Badge variant="neutral">Points: {stats.totalScore}/{stats.totalMax}</Badge>
            </div>
            <ul className="grid gap-2">
              {Object.entries(stats.byType).map(([k, v]) => (
                <li key={k}>
                  <Badge variant="info">
                    {k}: {v.correct}/{v.total}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Container>
    </section>
  );
}
