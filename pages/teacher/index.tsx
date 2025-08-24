import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Container } from '@/components/design-system/Container';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Student = { id: string; full_name: string | null; email: string | null; created_at: string | null };

export default function TeacherHome() {
  const [students, setStudents] = useState<Student[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      // Teachers can read students only (RLS enforces)
      let query = supabaseBrowser
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(100);
      if (q.trim()) {
        query = query.ilike('full_name', `%${q}%`);
      }
      const { data } = await query;
      setStudents((data ?? []) as Student[]);
    })();
  }, [q]);

  return (
    <RoleGuard allow={['teacher']}>
      <Head><title>Teacher · Dashboard</title></Head>
      <Container className="py-8">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/admin" className="rounded-xl border px-3 py-2 hover:shadow-sm">Admin (if allowed)</Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card title="Active Students" value="—" sub="RLS-scoped">
            {/* Replace later with real count via RPC */}
          </Card>
          <Card title="Attempts (7d)" value="—" sub="Demo" />
          <Card title="Avg Score" value="—" sub="Demo" />
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Students</h2>
            <input
              className="rounded-xl border px-3 py-2 bg-transparent w-64"
              placeholder="Search by name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{s.full_name ?? '—'}</td>
                    <td className="p-3">{s.email ?? '—'}</td>
                    <td className="p-3">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={3} className="p-6 text-center opacity-70">No students yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-medium mb-3">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Q href="/speaking/simulator" title="Open Speaking Simulator" desc="Demo session" />
            <Q href="/reading" title="Assign Reading Set" desc="Pick any test" />
            <Q href="/teacher" title="Create Cohort (soon)" desc="Group students" />
            <Q href="/teacher" title="Review Attempts (soon)" desc="Moderation queue" />
          </div>
        </section>
      </Container>
    </RoleGuard>
  );
}

function Card({ title, value, sub, children }: { title: string; value: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white/50 dark:bg-white/5 p-5">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
      {children}
    </div>
  );
}
function Q({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-2xl border p-4 hover:shadow-sm transition block">
      <div className="font-medium">{title}</div>
      <div className="text-sm opacity-70">{desc}</div>
    </Link>
  );
}
