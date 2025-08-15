import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';

type TestRow = {
  slug: string;
  title: string;
  master_audio_url: string | null;
};

type SectionRow = {
  test_slug: string;
  order_no: number;
  start_ms: number;
  end_ms: number;
};

type AttemptRow = {
  test_slug: string;
  updated_at: string | null;
};

type ListItem = {
  slug: string;
  title: string;
  durationSec: number; // derived from sections
  hasDraft: boolean;
  lastActivityAt?: string | null; // last attempt activity if any
};

const DRAFT_KEY = (slug: string) => `listen:${slug}`;

export default function ListeningIndexPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);

  // auth (client only)
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => mounted && setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription.unsubscribe();
  }, []);

  // load tests + sections (+ attempts if logged in)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [tRes, sRes] = await Promise.all([
          supabase.from('lm_listening_tests')
            .select('slug,title,master_audio_url')
            .order('created_at', { ascending: false }),
          supabase.from('lm_listening_sections')
            .select('test_slug,order_no,start_ms,end_ms')
            .order('order_no', { ascending: true }),
        ]);
        if (tRes.error) throw tRes.error;
        if (sRes.error) throw sRes.error;

        const tests = (tRes.data ?? []) as TestRow[];
        const sections = (sRes.data ?? []) as SectionRow[];

        // duration per test from min(start_ms) .. max(end_ms)
        const byTest: Record<string, { min: number; max: number }> = {};
        for (const s of sections) {
          const entry = byTest[s.test_slug] ?? { min: s.start_ms, max: s.end_ms };
          entry.min = Math.min(entry.min, s.start_ms);
          entry.max = Math.max(entry.max, s.end_ms);
          byTest[s.test_slug] = entry;
        }

        // attempts (optional)
        let attempts: AttemptRow[] = [];
        if (userId) {
          const aRes = await supabase
            .from('lm_listening_user_answers')
            .select('test_slug, updated_at')
            .eq('user_id', userId);
          if (aRes.error) throw aRes.error;
          attempts = (aRes.data ?? []) as AttemptRow[];
        }
        const lastByTest = attempts.reduce<Record<string, string | null>>((acc, r) => {
          const prev = acc[r.test_slug];
          acc[r.test_slug] =
            prev && r.updated_at ? (new Date(prev) > new Date(r.updated_at) ? prev : r.updated_at) : (prev ?? r.updated_at);
          return acc;
        }, {});

        const list: ListItem[] = tests.map((t) => {
          const span = byTest[t.slug];
          const durationSec = span ? Math.max(0, Math.round((span.max - span.min) / 1000)) : 0;
          const hasDraft = typeof window !== 'undefined' && !!localStorage.getItem(DRAFT_KEY(t.slug));
          return {
            slug: t.slug,
            title: t.title,
            durationSec,
            hasDraft,
            lastActivityAt: userId ? (lastByTest[t.slug] ?? null) : undefined,
          };
        });

        if (!cancelled) setItems(list);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? 'Failed to load tests');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // keep hasDraft reactive if localStorage changes elsewhere
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key?.startsWith('listen:')) return;
      setItems((prev) =>
        prev.map((it) => (e.key === DRAFT_KEY(it.slug) ? { ...it, hasDraft: !!localStorage.getItem(e.key) } : it))
      );
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const withDraft = items.filter((i) => i.hasDraft).length;
    return { total, withDraft };
  }, [items]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-slab text-4xl text-gradient-primary">Listening Tests</h1>
            <p className="text-grayish max-w-2xl">
              Pick a paper to start or resume where you left off. Auto‑play per section & transcript toggle are built in.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="info">Total: {stats.total}</Badge>
            <Badge variant="warning">Drafts: {stats.withDraft}</Badge>
          </div>
        </div>

        {err && <Alert className="mt-6" variant="error" title="Couldn’t load tests">{err}</Alert>}

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="card-surface p-6 rounded-ds-2xl">
                <div className="animate-pulse h-6 w-2/3 bg-gray-200 dark:bg-white/10 rounded mb-3" />
                <div className="animate-pulse h-4 w-1/3 bg-gray-200 dark:bg-white/10 rounded mb-6" />
                <div className="flex gap-2">
                  <div className="animate-pulse h-9 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="animate-pulse h-9 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="card-surface p-6 rounded-ds-2xl mt-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">No tests available yet</div>
                <p className="opacity-80">Add rows to <code>lm_listening_tests</code> and <code>lm_listening_sections</code>.</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const mins = Math.floor(it.durationSec / 60);
              const secs = it.durationSec % 60;
              const durationStr = it.durationSec ? `${mins}m ${secs}s` : '—';
              return (
                <Card key={it.slug} className="card-surface p-6 rounded-ds-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{it.title}</h3>
                      <div className="text-small opacity-80 mt-1">Slug: <code>{it.slug}</code></div>
                      <div className="text-small opacity-80 mt-1">Duration: {durationStr}</div>
                      {it.lastActivityAt && (
                        <div className="text-small opacity-80 mt-1">
                          Last activity: {new Date(it.lastActivityAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {it.hasDraft ? (
                        <Badge variant="warning" size="sm">Draft</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">New</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    {it.hasDraft ? (
                      <>
                        <Button as={Link as any} href={`/listening/${it.slug}`} variant="primary">
                          Resume
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            localStorage.removeItem(DRAFT_KEY(it.slug));
                            // update state immediately
                            setItems((prev) =>
                              prev.map((x) => (x.slug === it.slug ? { ...x, hasDraft: false } : x))
                            );
                          }}
                        >
                          Clear draft
                        </Button>
                      </>
                    ) : (
                      <Button as={Link as any} href={`/listening/${it.slug}`} variant="primary">
                        Start
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
