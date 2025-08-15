// pages/reading/index.tsx
import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';

type Passage = {
  slug: string;
  title: string;
  difficulty: 'Academic' | 'General';
  words: number | null;
  qCount: number;
  kinds: string[];
};

type Props = {
  rows: Passage[];
  q: string;
  diff: 'All' | 'Academic' | 'General';
  kind: 'All' | 'tfng' | 'mcq' | 'matching' | 'short';
};

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const q = String((ctx.query.q ?? '') as string).trim();
  const diffQ = (ctx.query.diff ?? 'All') as Props['diff'];
  const kindQ = (ctx.query.kind ?? 'All') as Props['kind'];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  let passQuery = supabase
    .from('reading_passages')
    .select('slug,title,difficulty,words,created_at')
    .order('created_at', { ascending: false });

  if (diffQ !== 'All') passQuery = passQuery.eq('difficulty', diffQ);
  const { data: passages, error: pErr } = await passQuery;
  if (pErr || !passages) return { props: { rows: [], q, diff: diffQ, kind: kindQ } };

  const { data: qAgg, error: qErr } = await supabase
    .from('reading_questions')
    .select('passage_slug, kind')
    .in('passage_slug', passages.map((p) => p.slug));

  if (qErr) return { props: { rows: [], q, diff: diffQ, kind: kindQ } };

  const bySlug = new Map<string, { qCount: number; kinds: Set<string> }>();
  for (const row of qAgg ?? []) {
    const key = row.passage_slug as string;
    if (!bySlug.has(key)) bySlug.set(key, { qCount: 0, kinds: new Set() });
    const bucket = bySlug.get(key)!;
    bucket.qCount += 1;
    if (row.kind) bucket.kinds.add(String(row.kind));
  }

  let rows: Passage[] = passages.map((p) => ({
    slug: p.slug,
    title: p.title,
    difficulty: (p.difficulty as any) ?? 'Academic',
    words: (p.words as any) ?? null,
    qCount: bySlug.get(p.slug)?.qCount ?? 0,
    kinds: Array.from(bySlug.get(p.slug)?.kinds ?? []),
  }));

  if (kindQ !== 'All') rows = rows.filter((r) => r.kinds.includes(kindQ));
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) => r.title.toLowerCase().includes(needle) || r.slug.toLowerCase().includes(needle)
    );
  }

  return { props: { rows, q, diff: diffQ, kind: kindQ } };
};

export default function ReadingCatalog({ rows, q, diff, kind }: Props) {
  const router = useRouter();

  return (
    <div className="py-24">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Reading — Practice Catalog</h1>
            <p className="text-sm text-gray-600 dark:text-grayish">
              Filter by difficulty and type. Click Start to open the runner.
            </p>
          </div>
          <Link href="/reading" className="text-sm underline">
            Reset filters
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-5 mb-6">
          <form method="GET" className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input name="q" placeholder="Search by title or slug" defaultValue={q} />
            </div>
            <div>
              <label className="block text-sm mb-1">Difficulty</label>
              <select
                name="diff"
                defaultValue={diff}
                className="w-full rounded-ds-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark px-3 py-2"
              >
                <option>All</option>
                <option>Academic</option>
                <option>General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select
                name="kind"
                defaultValue={kind}
                className="w-full rounded-ds-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark px-3 py-2"
              >
                <option value="All">All</option>
                <option value="tfng">TF/NG</option>
                <option value="mcq">MCQ</option>
                <option value="matching">Matching</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" variant="primary" className="rounded-ds-xl">
                Apply
              </Button>
            </div>
          </form>
        </Card>

        {/* List */}
        {rows.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-h3 font-semibold mb-2">No results</div>
            <p className="text-gray-600 dark:text-grayish">
              Try clearing filters or searching a different keyword.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rows.map((row) => (
              <Card key={row.slug} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/reading/passage/${row.slug}`} className="font-semibold truncate">
                        {row.title}
                      </Link>
                      <Badge>{row.difficulty}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-grayish">
                      <span className="mr-3">{row.qCount} questions</span>
                      {typeof row.words === 'number' && row.words > 0 && (
                        <span>{row.words} words</span>
                      )}
                    </div>
                    {row.kinds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.kinds.map((k) => (
                          <Badge key={k} className="bg-gray-100 dark:bg-white/10">
                            {k.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* FIX: navigate via router to avoid Button <a> support issues */}
                  <div className="shrink-0">
                    <Button
                      variant="primary"
                      className="rounded-ds-xl"
                      onClick={() => router.push(`/reading/passage/${row.slug}`)}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
