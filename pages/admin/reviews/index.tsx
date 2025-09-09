// pages/admin/reviews/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Role = 'student' | 'teacher' | 'admin';
type ModuleKind = 'speaking' | 'writing';

type AttemptRow = {
  id: string;
  user_name: string;
  user_email?: string;
  cohort?: string | null;
  module: ModuleKind;
  task: string; // e.g., "Task 2" or "Part 2"
  ai_band: number; // 0–9
  status: 'awaiting_review' | 'finalized' | 'in_progress';
  overridden?: boolean;
  created_at: string;     // ISO
  last_activity: string;  // ISO
};

type ApiResponse =
  | { ok: true; data: AttemptRow[] }
  | { ok: false; error: string };

const STATUS_BADGE: Record<AttemptRow['status'], { label: string; variant: 'warning' | 'info' | 'success' }> = {
  awaiting_review: { label: 'Awaiting Review', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'info' },
  finalized: { label: 'Finalized', variant: 'success' },
};

export default function AdminReviewsIndex() {
  const router = useRouter();
  const [roleOk, setRoleOk] = useState<boolean | null>(null);

  // Filters
  const [q, setQ] = useState('');
  const [moduleFilter, setModuleFilter] = useState<'all' | ModuleKind>('all');
  const [windowFilter, setWindowFilter] = useState<'7d' | '30d' | 'all'>('7d');
  const [cohortFilter, setCohortFilter] = useState<string>('all');

  // Data
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ------ Guard: teacher/admin only ------
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      const role: Role | undefined =
        (user?.user_metadata?.role as Role | undefined) ||
        (user?.app_metadata?.role as Role | undefined);
      const allowed = role === 'teacher' || role === 'admin';
      setRoleOk(allowed);
      if (!allowed) {
        // Optional: redirect non‑authorized users
        // router.replace('/'); // keep commented if you prefer to show a friendly message instead
      }
    })();
  }, [router]);

  // ------ Fetch list ------
  useEffect(() => {
    (async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch('/api/admin/reviews');
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json: ApiResponse = await res.json();
        if (!json.ok) throw new Error(json.error);
        setRows(json.data);
      } catch (e: unknown) {
        setApiError(e instanceof Error ? e.message : 'Failed to load reviews.');
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------ Derived filters ------
  const cohorts = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => { if (r.cohort) set.add(r.cohort); });
    return ['all', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const msWindow = windowFilter === '7d' ? 7 : windowFilter === '30d' ? 30 : 3650; // ~10y for "all"
    const cutoff = now - msWindow * 24 * 60 * 60 * 1000;

    return rows.filter(r => {
      if (moduleFilter !== 'all' && r.module !== moduleFilter) return false;
      if (cohortFilter !== 'all' && r.cohort !== cohortFilter) return false;
      if (windowFilter !== 'all' && new Date(r.last_activity).getTime() < cutoff) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        const hay = `${r.user_name} ${r.user_email ?? ''} ${r.task}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, moduleFilter, cohortFilter, windowFilter, q]);

  // ------ UI ------
  return (
    <>
      <Head><title>Admin • Reviews | GramorX</title></Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="mb-6">
            <h1 className="font-slab text-display text-gradient-primary">Teacher Reviews</h1>
            <p className="text-grayish max-w-2xl">
              Moderate <span className="font-semibold">Writing & Speaking</span> attempts — adjust AI bands with a reason,
              and keep an audit trail. {/* matches Phase‑1 priority */}
            </p>
          </div>

          {roleOk === false && (
            <Alert variant="error" title="Access denied" className="mb-6">
              You need a <b>teacher</b> or <b>admin</b> role to open this page.
            </Alert>
          )}

          {apiError && (
            <Alert variant="warning" title="Data source missing" className="mb-6">
              Couldn’t load <code>/api/admin/reviews</code>. Create an API that returns an array of attempts with:
              <code className="ml-2">[{`{ id, user_name, user_email?, cohort?, module, task, ai_band, status, overridden?, created_at, last_activity }`}]</code>.
              You can wire it to a Supabase view/RPC with RLS for teacher/admin.
            </Alert>
          )}

          <Card className="p-6 rounded-ds-2xl">
            {/* Filters */}
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="block text-small text-gray-600 dark:text-grayish mb-1">Search</label>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Student, email, task…"
                  className="w-full rounded-ds border bg-white text-lightText placeholder-gray-500
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:border-primary
                             dark:bg-dark/50 dark:text-white dark:placeholder-white/40 dark:border-purpleVibe/30
                             dark:focus-visible:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                />
              </div>

              <div>
                <label className="block text-small text-gray-600 dark:text-grayish mb-1">Module</label>
                <select
                  value={moduleFilter}
                  onChange={e => setModuleFilter(e.target.value as 'all' | ModuleKind)}
                  className="w-full rounded-ds border bg-white text-lightText
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:border-primary
                             dark:bg-dark/50 dark:text-white dark:border-purpleVibe/30 dark:focus-visible:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                >
                  <option value="all">All</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-small text-gray-600 dark:text-grayish mb-1">Time window</label>
                <select
                  value={windowFilter}
                  onChange={e => setWindowFilter(e.target.value as '7d' | '30d' | 'all')}
                  className="w-full rounded-ds border bg-white text-lightText
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:border-primary
                             dark:bg-dark/50 dark:text-white dark:border-purpleVibe/30 dark:focus-visible:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <div>
                <label className="block text-small text-gray-600 dark:text-grayish mb-1">Cohort</label>
                <select
                  value={cohortFilter}
                  onChange={e => setCohortFilter(e.target.value)}
                  className="w-full rounded-ds border bg-white text-lightText
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus:border-primary
                             dark:bg-dark/50 dark:text-white dark:border-purpleVibe/30 dark:focus-visible:ring-electricBlue dark:focus:border-electricBlue py-2.5 px-3.5"
                >
                  {cohorts.map(c => <option key={c} value={c}>{c === 'all' ? 'All cohorts' : c}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-grayish">
                    <th className="py-2.5 pr-3">Student</th>
                    <th className="py-2.5 pr-3">Module</th>
                    <th className="py-2.5 pr-3">Task</th>
                    <th className="py-2.5 pr-3">AI Band</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Updated</th>
                    <th className="py-2.5 pr-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="border-t border-gray-200/40 dark:border-white/10">
                        <td colSpan={7} className="py-3">
                          <div className="animate-pulse h-5 w-full bg-gray-200 dark:bg-white/10 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr className="border-t border-gray-200/40 dark:border-white/10">
                      <td colSpan={7} className="py-6 text-grayish">No attempts found for the selected filters.</td>
                    </tr>
                  ) : (
                    filtered.map(row => {
                      const badge = STATUS_BADGE[row.status];
                      const updated = new Date(row.last_activity).toLocaleString();
                      return (
                        <tr key={row.id} className="border-t border-gray-200/40 dark:border-white/10 hover:bg-purpleVibe/5 dark:hover:bg-white/5">
                          <td className="py-3 pr-3">
                            <div className="font-medium">{row.user_name}</div>
                            <div className="text-small opacity-80">{row.user_email ?? '—'}</div>
                          </td>
                          <td className="py-3 pr-3 capitalize">{row.module}</td>
                          <td className="py-3 pr-3">{row.task}</td>
                          <td className="py-3 pr-3">
                            <span className="font-semibold">{row.ai_band.toFixed(1)}</span>
                            {row.overridden && (
                              <Badge variant="warning" size="sm" className="ml-2">Overridden</Badge>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                          </td>
                          <td className="py-3 pr-3 whitespace-nowrap">{updated}</td>
                          <td className="py-3 pr-3">
                            <Link href={`/admin/reviews/${row.id}`} legacyBehavior>
                              <Button as="a" variant="primary" className="rounded-ds">Open</Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
