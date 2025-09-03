import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { NavLink } from '@/components/design-system/NavLink';
import { Alert } from '@/components/design-system/Alert';

type Category = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Study Plan' | 'Product';
type Sort = 'newest' | 'popular';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  tags: string[];
  date: string;        // mapped from published_at
  readMin: number;     // mapped from read_min
  likes: number;
  hero?: string | null;
};

type ApiListResp = {
  ok: boolean;
  items: {
    id: string; slug: string; title: string; excerpt: string; category: Category; tags: string[];
    read_min: number; likes: number; published_at: string | null; hero_image_url: string | null;
  }[];
  pageInfo: { page: number; pageSize: number; total: number; totalPages: number };
  tagCloud: string[];
  message?: string;
};

const CATEGORIES = ['All', 'Listening', 'Reading', 'Writing', 'Speaking', 'Study Plan', 'Product'] as const;
type CategoryFilter = typeof CATEGORIES[number];

export default function BlogIndex() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryFilter>('All');
  const [sort, setSort] = useState<Sort>('newest');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tagCloud, setTagCloud] = useState<string[]>([]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        sort,
      });
      if (q) params.set('q', q);
      if (cat !== 'All') params.set('category', cat);
      const resp = await fetch(`/api/blog?${params.toString()}`);
      const json = (await resp.json()) as ApiListResp;
      if (!resp.ok || !json.ok) throw new Error(json.message || 'Failed to load blog');
      setTotalPages(json.pageInfo.totalPages);
      setTagCloud(json.tagCloud || []);
      setItems(
        (json.items || []).map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags || [],
          date: p.published_at || '',
          readMin: p.read_min,
          likes: p.likes,
          hero: p.hero_image_url,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load blog');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q, cat, sort, page]);

  return (
    <>
      <Head>
        <title>Blog — GramorX</title>
        <meta name="description" content="Tips, study plans, and updates for IELTS Listening, Reading, Writing, and Speaking." />
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="max-w-3xl">
            <h1 className="font-slab text-display text-gradient-primary">GramorX Blog</h1>
            <p className="text-grayish mt-3">
              Learn faster with compact strategies, realistic plans, and AI-powered insights.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button as="a" href="/writing" variant="primary" className="rounded-ds-xl">Start Writing Practice</Button>
              <Button as="a" href="/speaking" variant="secondary" className="rounded-ds-xl">Open Speaking Lab</Button>
              <Button as="a" href="/pricing" variant="accent" className="rounded-ds-xl">Unlock Premium</Button>
            </div>
          </div>

          <Card className="mt-10 p-5 rounded-ds-2xl">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <Input
                label="Search articles"
                placeholder="Try “t/f/ng”, “cue card”, “study plan”…"
                value={q}
                onChange={e => { setQ(e.currentTarget.value); setPage(1); }}
                iconLeft={<i className="fas fa-search" aria-hidden="true" />}
              />
              <label className="block">
                <span className="mb-1.5 inline-block text-small text-grayish">Category</span>
                <select
                  className="w-full rounded-ds border bg-white text-lightText dark:bg-dark/50 dark:text-white
                             dark:border-purpleVibe/30 focus:outline-none focus:ring-2 focus:ring-primary py-3 px-3"
                  value={cat}
                  onChange={e => { setCat(e.target.value as CategoryFilter); setPage(1); }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 inline-block text-small text-grayish">Sort</span>
                <select
                  className="w-full rounded-ds border bg-white text-lightText dark:bg-dark/50 dark:text-white
                             dark:border-purpleVibe/30 focus:outline-none focus:ring-2 focus:ring-primary py-3 px-3"
                  value={sort}
                  onChange={e => setSort(e.target.value as Sort)}
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most liked</option>
                </select>
              </label>
            </div>

            {!!tagCloud.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tagCloud.map(t => (
                  <button
                    key={t}
                    onClick={() => { setQ(t); setPage(1); }}
                    className="px-3 py-1.5 rounded-ds text-small border border-electricBlue/30 text-electricBlue bg-electricBlue/10 hover:bg-electricBlue/15"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {error && <Alert className="mt-6" variant="error" title="Could not load">{error}</Alert>}

          {/* Grid */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(p => (
              <Card key={p.id} className="p-5 rounded-ds-2xl hover:translate-y-[-2px] transition">
                <div className="aspect-video rounded-ds bg-gradient-to-br from-primary/15 to-accent/15 mb-4 overflow-hidden">
                  {p.hero ? (
                    <Image
                      src={p.hero}
                      alt=""
                      fill
                      unoptimized
                      className="w-full h-full object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : null}
                </div>
                <Link href={`/blog/${p.slug}`} className="text-left block">
                  <h3 className="font-semibold text-h4 leading-snug">{p.title}</h3>
                </Link>
                <p className="text-grayish mt-2">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-small text-grayish">
                  <span>{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                  <span>{p.readMin} min read</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map(t => (
                    <span key={t} className="px-2 py-1 rounded-ds bg-white/60 dark:bg-white/10 text-small">{t}</span>
                  ))}
                </div>
                <div className="mt-5">
                  <Link href={`/blog/${p.slug}`} className="underline">Read more</Link>
                </div>
              </Card>
            ))}

            {/* Loading state */}
            {busy && !items.length && Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5 rounded-ds-2xl animate-pulse">
                <div className="aspect-video rounded-ds bg-white/50 dark:bg-white/5 mb-4" />
                <div className="h-4 bg-white/50 dark:bg-white/5 rounded mb-2" />
                <div className="h-4 w-2/3 bg-white/50 dark:bg-white/5 rounded" />
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="ghost" className="rounded-ds" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <div className="px-3 py-1 rounded-ds bg-white/70 dark:bg-white/10">{page} / {totalPages}</div>
            <Button variant="ghost" className="rounded-ds" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>

          {/* Deep links */}
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Practice Modules</div>
              <div className="flex flex-wrap gap-2">
                <NavLink href="/listening" label="Listening" />
                <NavLink href="/reading" label="Reading" />
                <NavLink href="/writing" label="Writing" />
                <NavLink href="/speaking" label="Speaking" />
              </div>
            </Card>
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Reports & History</div>
              <div className="flex flex-wrap gap-2">
                <NavLink href="/reading/history" label="Reading History" />
                <NavLink href="/speaking/attempts" label="Speaking Attempts" />
                <NavLink href="/admin/reports" label="Admin Reports" />
              </div>
            </Card>
            <Card className="p-5 rounded-ds-2xl">
              <div className="font-semibold mb-1">Account</div>
              <div className="flex flex-wrap gap-2">
                <NavLink href="/pricing" label="Pricing" />
                <NavLink href="/profile/setup" label="Profile" />
                <NavLink href="/support" label="Support" />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
