// pages/reading/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { ReadingFilterBar } from '@/components/reading/ReadingFilterBar';

type Kind = 'tfng' | 'mcq' | 'matching' | 'short';
type ReadingListItem = {
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  qCount: number;
  estMinutes: number;
  types: Kind[];
};

export default function ReadingListPage() {
  const [items, setItems] = useState<ReadingListItem[] | null>(null);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const activeType = (router.query.type as string) || 'all';

  useEffect(() => {
    try {
      setItems([
        {
          slug: 'sample-reading-1',
          title: 'The Honey Bee Ecosystem',
          difficulty: 'Medium',
          qCount: 14,
          estMinutes: 20,
          types: ['tfng', 'mcq', 'matching', 'short'],
        },
        {
          slug: 'sample-reading-2',
          title: 'Migration Patterns',
          difficulty: 'Easy',
          qCount: 8,
          estMinutes: 12,
          types: ['mcq', 'short'],
        },
      ]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    }
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [] as ReadingListItem[];
    if (activeType === 'all') return items;
    return items.filter((i) => i.types.includes(activeType as Kind));
  }, [items, activeType]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary">Reading Practice</h1>
        <p className="text-grayish max-w-2xl">
          Choose a passage and start a timed practice. Your answers autosave locally.
        </p>

        <ReadingFilterBar className="mt-6" />

        {error && (
          <div className="mt-6">
            <Alert variant="error" title="Couldn’t load tests">
              {error}
            </Alert>
          </div>
        )}

        {!items ? (
          <div className="mt-10">
            <Card className="p-6">
              <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
            </Card>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Card key={t.slug} className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-h3 font-semibold mb-1">{t.title}</h3>
                  <div className="flex items-center gap-2 text-small text-grayish">
                    <Badge
                      variant={
                        t.difficulty === 'Hard'
                          ? 'danger'
                          : t.difficulty === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {t.difficulty}
                    </Badge>
                    <span>{t.qCount} Questions</span>
                    <span>•</span>
                    <span>{t.estMinutes} min</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href={`/reading/${t.slug}`} className="inline-block">
                    <Button variant="primary" className="rounded-ds-xl">
                      Start
                    </Button>
                  </Link>
                  <Link href={`/reading/${t.slug}#preview`} className="inline-block">
                    <Button variant="secondary" className="rounded-ds-xl">
                      Preview
                    </Button>
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
