// pages/content/studio/index.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { supabaseServer } from '@/lib/supabaseServer';

export type ContentItem = {
  id: string;
  title: string | null;
  module: 'listening' | 'reading' | 'writing' | 'speaking' | null;
  status: 'draft' | 'published' | 'archived';
  updated_at: string | null;
};

export type StudioIndexProps = { ok: true; items: ContentItem[] } | { ok: false; error: string };

export const getServerSideProps: GetServerSideProps<StudioIndexProps> = async (ctx) => {
  try {
    const supabase = supabaseServer(ctx.req as any, ctx.res as any);
    const { data, error } = await supabase
      .from('content_items')
      .select('id, title, module, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) return { props: { ok: false, error: error.message } };
    return { props: { ok: true, items: (data ?? []) as ContentItem[] } };
  } catch (e: any) {
    return { props: { ok: false, error: e?.message || 'Unexpected error' } };
  }
};

export default function StudioIndexPage(props: StudioIndexProps) {
  if (!props.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-slab text-2xl">Content Studio</h1>
          <p className="mt-2 text-sunsetRed">{props.error}</p>
        </div>
      </main>
    );
  }

  const { items } = props;
  const [q, setQ] = React.useState('');

  const filtered = React.useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return items;
    return items.filter((i) => (i.title ?? '').toLowerCase().includes(needle));
  }, [items, q]);

  return (
    <>
      <Head>
        <title>Content Studio</title>
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-slab text-2xl md:text-3xl">Content Studio</h1>
            <Link href="/content/studio/new" className="inline-flex">
              <Button variant="primary" className="bg-primary text-primary-foreground">
                New Item
              </Button>
            </Link>
          </div>
          <p className="mt-1 text-sm text-mutedText">
            Create and manage IELTS practice content for all modules.
          </p>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title…"
              className="rounded-xl border border-border bg-card px-3 py-2"
            />
            <div className="self-center text-sm text-mutedText">
              {filtered.length} of {items.length}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-4 pb-12">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <h3 className="font-slab text-xl">No content yet</h3>
              <p className="mt-2 text-mutedText">Use “New Item” to add your first practice set.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((it) => {
                const statusClass =
                  it.status === 'published'
                    ? 'bg-success/15 text-success'
                    : it.status === 'draft'
                      ? 'bg-goldenYellow/15 text-goldenYellow'
                      : 'bg-sunsetRed/15 text-sunsetRed';

                const when = it.updated_at
                  ? new Date(it.updated_at).toLocaleString()
                  : '—';

                return (
                  <Link
                    key={it.id}
                    href={`/content/studio/${it.id}`}
                    className="block rounded-2xl border border-lightBorder bg-card p-4 transition hover:shadow-glow"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="line-clamp-1 font-medium">{it.title ?? 'Untitled'}</div>
                      <span className={cls('rounded-lg px-2 py-1 text-xs', statusClass)}>{it.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-mutedText">
                      {(it.module ?? '—').toString().toUpperCase()} · Updated {when}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}
