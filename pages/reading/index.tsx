// pages/reading/index.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';

type ReadingListItem = { slug: string; title: string; difficulty: 'Easy'|'Medium'|'Hard'; qCount: number; estMinutes: number };

export default function ReadingListPage() {
  const [items, setItems] = useState<ReadingListItem[]|null>(null);
  const [error, setError] = useState<string|undefined>();

  useEffect(() => {
    try {
      setItems([
        { slug: 'sample-reading-1', title: 'The Honey Bee Ecosystem', difficulty: 'Medium', qCount: 14, estMinutes: 20 },
      ]);
    } catch (e:any) { setError(e?.message || 'Failed to load'); }
  }, []);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary">Reading Practice</h1>
        <p className="text-grayish max-w-2xl">Choose a passage and start a timed practice. Your answers autosave locally.</p>

        {error && <div className="mt-6"><Alert variant="error" title="Couldn’t load tests">{error}</Alert></div>}

        {!items ? (
          <div className="mt-10">
            <Card className="p-6"><div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" /></Card>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(t => (
              <Card key={t.slug} className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-h3 font-semibold mb-1">{t.title}</h3>
                  <div className="flex items-center gap-2 text-small text-grayish">
                    <Badge variant={t.difficulty==='Hard' ? 'danger' : t.difficulty==='Medium' ? 'warning' : 'success'} size="sm">
                      {t.difficulty}
                    </Badge>
                    <span>{t.qCount} Questions</span>
                    <span>•</span>
                    <span>{t.estMinutes} min</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href={`/reading/${t.slug}`} className="inline-block">
                    <Button variant="primary" className="rounded-ds-xl">Start</Button>
                  </Link>
                  <Link href={`/reading/${t.slug}#preview`} className="inline-block">
                    <Button variant="secondary" className="rounded-ds-xl">Preview</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
