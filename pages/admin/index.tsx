// pages/admin/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ✅ Use DS primitives; fall back to Tailwind if a component is missing in DS.
import { Container } from '@/components/design-system/Container';
// import { Card } from '@/components/design-system/Card';
// import { Button } from '@/components/design-system/Button';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { getCurrentRole } from '@/lib/roles';
import type { AppRole } from '@/lib/roles';
import { useToast } from '@/components/design-system/Toaster';

// ---- Types ----
type KPI = { label: string; value: string; sub?: string; href?: string };
type Signup = { id: string; name: string; email: string; joinedAt: string };
type QueueRow = {
  id: string;
  type: 'writing' | 'speaking';
  status: 'pending' | 'scored' | 'error';
  provider: 'openai' | 'gemini' | 'groq' | 'vertex';
  submittedAt: string;
};
type ModulePerf = {
  module: 'Listening' | 'Reading' | 'Writing' | 'Speaking';
  attempts: number;
  avgBand: number;
  trend: 'up' | 'down' | 'flat';
};

type BlogQueueItem = {
  slug: string;
  title: string;
  author?: string | null;
  category: 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Study Plan' | 'Product';
  submittedAt: string;
  tags: string[];
};
type SupportTicket = {
  ticketId: string;
  email: string;
  subject: string;
  category: 'account' | 'billing' | 'modules' | 'ai' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
};

type ProviderStatus = {
  name: 'Supabase' | 'SMTP' | 'OpenAI' | 'Gemini' | 'Groq' | 'Vertex' | 'Storage' | 'Realtime';
  state: 'ok' | 'degraded' | 'down';
  last: string;
  href?: string;
};

export default function AdminIndex() {
  // Faux loading for polish
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  // 🔎 Top toolbar state
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [module, setModule] = useState<'all' | 'listening' | 'reading' | 'writing' | 'speaking'>('all');
  const [q, setQ] = useState(''); // global quick search filter (signups, tickets)

  const { success, error: toastError } = useToast();

  // 🧪 Demo data — replace with Supabase later
  const kpis: KPI[] = useMemo(
    () => [
      { label: 'Active Students', value: '1,284', sub: 'last 7 days', href: '/admin/students?active=1' },
      { label: 'Weekly Attempts', value: '3,942', sub: 'all modules', href: `/admin/reports?range=last-7d` },
      { label: 'Avg Band (All)', value: '6.4', sub: '±0.2 vs prev', href: `/admin/reports?range=last-7d&module=${module}` },
      { label: 'AI Queue Pending', value: '37', sub: 'writing/speaking', href: '/admin/ai-queue?status=pending' },
      { label: 'New Blog Submissions', value: '5', sub: 'awaiting review', href: '/admin/blog/moderation' },
      { label: 'Open Support Tickets', value: '12', sub: 'last 24h', href: '/admin/support' },
    ],
    [module]
  );

  const signups: Signup[] = [
    { id: 'u1', name: 'Ayesha Khan', email: 'ayesha@example.com', joinedAt: '2025-08-21 15:12' },
    { id: 'u2', name: 'Bilal Ahmed', email: 'bilal@example.com', joinedAt: '2025-08-21 13:47' },
    { id: 'u3', name: 'Chen Wei', email: 'chen@example.com', joinedAt: '2025-08-21 11:05' },
  ];

  const queue: QueueRow[] = [
    { id: 'q101', type: 'speaking', status: 'pending', provider: 'groq', submittedAt: '2025-08-22 22:11' },
    { id: 'q102', type: 'writing', status: 'pending', provider: 'vertex', submittedAt: '2025-08-22 21:58' },
    { id: 'q103', type: 'speaking', status: 'error', provider: 'gemini', submittedAt: '2025-08-22 21:50' },
  ];

  const perf: ModulePerf[] = [
    { module: 'Listening', attempts: 1094, avgBand: 6.7, trend: 'up' },
    { module: 'Reading', attempts: 986, avgBand: 6.5, trend: 'flat' },
    { module: 'Writing', attempts: 934, avgBand: 6.0, trend: 'up' },
    { module: 'Speaking', attempts: 928, avgBand: 6.2, trend: 'down' },
  ];

  const blogQueue: BlogQueueItem[] = [
    {
      slug: 'speaking-part-3-follow-up-mastery',
      title: 'Speaking Part 3: Follow-up Mastery',
      author: 'teacher_ali',
      category: 'Speaking',
      submittedAt: '2025-08-22 20:31',
      tags: ['speaking', 'band-7'],
    },
    {
      slug: 'reading-matching-headings-quick-scan',
      title: 'Reading: Matching Headings with Quick Scan',
      author: 'coach_mina',
      category: 'Reading',
      submittedAt: '2025-08-22 18:04',
      tags: ['reading', 'scan', 'tactics'],
    },
    {
      slug: 'writing-task-1-trends-phrasing',
      title: 'Writing Task 1: Trends & Phrasing Pack',
      author: 'mentor_omar',
      category: 'Writing',
      submittedAt: '2025-08-22 16:49',
      tags: ['writing', 'task1'],
    },
  ];

  const tickets: SupportTicket[] = [
    {
      ticketId: 'GX-20250823-AB12CD',
      email: 'sara@example.com',
      subject: 'Mic not working in Speaking',
      category: 'technical',
      status: 'open',
      createdAt: '2025-08-23 09:22',
    },
    {
      ticketId: 'GX-20250823-EF34GH',
      email: 'omer@example.com',
      subject: 'Upgrade to Booster failed',
      category: 'billing',
      status: 'in_progress',
      createdAt: '2025-08-23 08:11',
    },
    {
      ticketId: 'GX-20250822-IJ56KL',
      email: 'nida@example.com',
      subject: 'How to submit Writing Task 2?',
      category: 'modules',
      status: 'resolved',
      createdAt: '2025-08-22 21:42',
    },
  ];

  const providers: ProviderStatus[] = [
    { name: 'Supabase', state: 'ok', last: 'now', href: '/admin/system/supabase' },
    { name: 'SMTP', state: 'ok', last: '5m ago', href: '/admin/system/email' },
    { name: 'OpenAI', state: 'ok', last: 'now', href: '/admin/ai-usage?provider=openai' },
    { name: 'Gemini', state: 'degraded', last: '12m ago', href: '/admin/ai-usage?provider=gemini' },
    { name: 'Groq', state: 'ok', last: '2m ago', href: '/admin/ai-usage?provider=groq' },
    { name: 'Vertex', state: 'ok', last: '3m ago', href: '/admin/ai-usage?provider=vertex' },
    { name: 'Storage', state: 'ok', last: 'now', href: '/admin/system/storage' },
    { name: 'Realtime', state: 'ok', last: 'now', href: '/admin/system/realtime' },
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getCurrentRole().then((r) => setRole(r));
  }, []);

  // CSV export for quick wins
  const exportCSV = () => {
    const rows = [
      ['module', 'attempts', 'avgBand'],
      ...perf.map((r) => [r.module, String(r.attempts), String(r.avgBand)]),
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `module-performance-${range}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handlers
  const moderatePost = async (slug: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/blog/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        success(
          data?.message || `Post ${action === 'approve' ? 'approved' : 'rejected'}`
        );
      } else {
        toastError(data?.error || 'Moderation failed');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Moderation failed');
    }
  };

  const approvePost = (slug: string) => moderatePost(slug, 'approve');
  const rejectPost = (slug: string) => moderatePost(slug, 'reject');

  const filteredSignups = signups.filter((s) =>
    q ? (s.name + s.email).toLowerCase().includes(q.toLowerCase()) : true
  );
  const filteredTickets = tickets.filter((t) =>
    q ? (t.ticketId + t.email + t.subject).toLowerCase().includes(q.toLowerCase()) : true
  );

  return (
    <RoleGuard allow={['admin', 'teacher'] as any}>
      <Head>
        <title>Admin • Overview</title>
      </Head>

      <Container as="main" className="py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of IELTS modules, AI evaluation, blog moderation, and support operations.
            </p>
          </div>

          {/* Top toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="h-9 rounded-xl border bg-transparent px-3 text-sm"
              aria-label="Date Range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <select
              value={module}
              onChange={(e) => setModule(e.target.value as any)}
              className="h-9 rounded-xl border bg-transparent px-3 text-sm"
              aria-label="Module"
            >
              <option value="all">All Modules</option>
              <option value="listening">Listening</option>
              <option value="reading">Reading</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search (students, tickets)…"
              className="h-9 rounded-xl border bg-transparent px-3 text-sm w-56"
            />
            <button
              onClick={exportCSV}
              className="h-9 rounded-xl border px-3 text-sm hover:bg-muted"
              aria-label="Export CSV"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {[
            { label: 'Students', href: '/admin/students?active=1', roles: ['admin', 'teacher'] },
            { label: 'Teachers', href: '/admin/teachers', roles: ['admin'] },
            { label: 'Reports', href: `/admin/reports?range=last-7d`, roles: ['admin', 'teacher'] },
            { label: 'AI Queue', href: '/admin/ai-queue?status=pending', roles: ['admin'] },
            { label: 'Blog Moderation', href: '/admin/blog/moderation', roles: ['admin', 'teacher'] },
            { label: 'Support', href: '/admin/support', roles: ['admin', 'teacher'] },
          ]
            .filter((item) => !role || item.roles.includes(role))
            .map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-2xl border p-3 hover:bg-muted transition"
              >
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground group-hover:underline">Open →</div>
              </Link>
            ))}
        </div>

        {role === 'admin' && (
          <Link href="/admin/users" className="font-medium text-primary hover:underline">
            Manage Users
          </Link>
        )}

        {/* KPI Cards */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k) => (
            <Link
              key={k.label}
              href={k.href || '#'}
              className="rounded-2xl border p-4 hover:shadow-sm hover:-translate-y-0.5 transition bg-card"
            >
              <div className="text-sm text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-semibold mt-1">{k.value}</div>
              {k.sub && <div className="text-xs text-muted-foreground mt-1">{k.sub}</div>}
            </Link>
          ))}
        </section>

        {/* Module Health */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">IELTS Module Health</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {perf.map((m) => {
              const slug = m.module.toLowerCase();
              return (
                <Link
                  key={m.module}
                  href={`/admin/modules/${slug}?range=${range}`}
                  className="rounded-2xl border p-4 hover:bg-muted transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{m.module}</div>
                    <span
                      className={{
                        up: 'text-green-600 dark:text-green-400',
                        down: 'text-red-600 dark:text-red-400',
                        flat: 'text-muted-foreground',
                      }[m.trend]}
                    >
                      {m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '–'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{m.attempts} attempts</div>
                  <div className="text-xl font-semibold mt-1">Avg {m.avgBand.toFixed(1)}</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Three-up: AI Queue + Recent Signups + System Status */}
        <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* AI Queue */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">AI Evaluation Queue</h3>
              <Link className="text-sm underline" href="/admin/ai-queue?status=pending">
                Open full queue
              </Link>
            </div>
            <div className="border-t">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="p-3">ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs">{r.id}</td>
                        <td className="p-3 capitalize">{r.type}</td>
                        <td className="p-3 uppercase text-xs">{r.provider}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs border ${
                              r.status === 'pending'
                                ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                                : r.status === 'scored'
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-red-500 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{r.submittedAt}</td>
                        <td className="p-3">
                          <Link
                            href={`/admin/moderation?type=${r.type}&attempt=${r.id}`}
                            className="text-xs underline"
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Signups */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">Recent Signups</h3>
              <Link className="text-sm underline" href="/admin/students?sort=joined_at.desc">
                View all
              </Link>
            </div>
            <div className="border-t">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignups.map((s) => (
                      <tr key={s.id} className="border-b last:border-0">
                        <td className="p-3">{s.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{s.email}</td>
                        <td className="p-3 text-xs text-muted-foreground">{s.joinedAt}</td>
                        <td className="p-3">
                          <Link className="text-xs underline" href={`/admin/students?id=${s.id}`}>
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">System Status</h3>
              <Link className="text-sm underline" href="/admin/system">
                Status page
              </Link>
            </div>
            <div className="border-t divide-y">
              {providers.map((p) => (
                <Link
                  key={p.name}
                  href={p.href || '#'}
                  className="flex items-center justify-between p-3 hover:bg-muted transition"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot state={p.state} />
                    <div className="font-medium">{p.name}</div>
                  </div>
                  <div
                    className={
                      p.state === 'ok'
                        ? 'text-xs text-green-600 dark:text-green-400'
                        : p.state === 'degraded'
                        ? 'text-xs text-amber-600 dark:text-amber-400'
                        : 'text-xs text-red-600 dark:text-red-400'
                    }
                  >
                    {p.state.toUpperCase()} • {p.last}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Two-up: Blog Moderation + Support Tickets */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Blog Moderation Queue */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">Blog Moderation Queue</h3>
              <div className="flex items-center gap-2">
                <Link className="text-sm underline" href="/admin/blog/new">
                  New post
                </Link>
                <Link className="text-sm underline" href="/admin/blog/moderation">
                  Open queue
                </Link>
              </div>
            </div>
            <div className="border-t">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : blogQueue.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No submissions — great!</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Author</th>
                      <th className="p-3">Tags</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogQueue.map((b) => (
                      <tr key={b.slug} className="border-b last:border-0">
                        <td className="p-3">
                          <Link className="underline" href={`/blog/${b.slug}`}>
                            {b.title}
                          </Link>
                        </td>
                        <td className="p-3">{b.category}</td>
                        <td className="p-3 text-xs text-muted-foreground">{b.author ?? '—'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {b.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-lg text-xs bg-white/60 dark:bg-white/10"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{b.submittedAt}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approvePost(b.slug)}
                              className="h-8 rounded-lg border px-2 text-xs hover:bg-green-50 dark:hover:bg-green-900/10"
                              aria-label="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectPost(b.slug)}
                              className="h-8 rounded-lg border px-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/10"
                              aria-label="Reject"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-semibold">Support Tickets (24h)</h3>
              <Link className="text-sm underline" href="/admin/support">
                Open Support
              </Link>
            </div>
            <div className="border-t">
              {loading ? (
                <SkeletonRows rows={3} />
              ) : filteredTickets.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No tickets match your search.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr className="border-b">
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => (
                      <tr key={t.ticketId} className="border-b last:border-0">
                        <td className="p-3 font-mono text-xs">{t.ticketId}</td>
                        <td className="p-3">
                          <div className="truncate max-w-[18ch]" title={t.subject}>
                            {t.subject}
                          </div>
                          <div className="text-xs text-muted-foreground">{t.email}</div>
                        </td>
                        <td className="p-3 capitalize">{t.category}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs border ${
                              t.status === 'open'
                                ? 'border-amber-400 text-amber-600 dark:text-amber-400'
                                : t.status === 'in_progress'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : t.status === 'resolved'
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-muted-foreground text-muted-foreground'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{t.createdAt}</td>
                        <td className="p-3">
                          <Link className="text-xs underline" href={`/admin/support?ticket=${t.ticketId}`}>
                            Open →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* CTA Row */}
        {role === 'admin' && (
          <section className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/admin/reports?range=last-30d&module=all"
              className="rounded-xl border px-4 h-10 inline-grid place-items-center hover:bg-muted"
            >
              Generate Monthly Report
            </Link>
            <Link
              href="/admin/teachers?invite=1"
              className="rounded-xl border px-4 h-10 inline-grid place-items-center hover:bg-muted"
            >
              Invite Teacher
            </Link>
            <Link
              href="/admin/tools/cache?invalidate=1"
              className="rounded-xl border px-4 h-10 inline-grid place-items-center hover:bg-muted"
            >
              Invalidate Caches
            </Link>
            <Link
              href="/admin/blog/new"
              className="rounded-xl border px-4 h-10 inline-grid place-items-center hover:bg-muted"
            >
              Compose Blog Post
            </Link>
            <Link
              href="/admin/system/sync"
              className="rounded-xl border px-4 h-10 inline-grid place-items-center hover:bg-muted"
            >
              Run Nightly Sync
            </Link>
          </section>
        )}
      </Container>
    </RoleGuard>
  );
}

// ---- Small UI helpers ----
function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function StatusDot({ state }: { state: ProviderStatus['state'] }) {
  const cls =
    state === 'ok'
      ? 'bg-green-500'
      : state === 'degraded'
      ? 'bg-amber-500'
      : 'bg-red-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} aria-hidden />;
}
