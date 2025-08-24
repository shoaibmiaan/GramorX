// pages/admin/students/index.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Container } from '@/components/design-system/Container';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at?: string | null;
  role?: string | null;
};

export default function Students() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      let query = supabaseBrowser
        .from('profiles')
        .select('id, full_name, email, created_at, role')
        .order('created_at', { ascending: false })
        .limit(200);
      if (q.trim()) {
        query = query.ilike('full_name', `%${q}%`);
      }
      const { data } = await query;
      if (data) setRows(data as Profile[]);
    })();
  }, [q]);

  return (
    <AdminGuard>
      <Head><title>Admin · Students</title></Head>
      <Container className="py-8">
        <h1 className="text-2xl font-semibold mb-4">Students</h1>
        <input
          className="rounded-xl border px-3 py-2 bg-transparent w-full sm:w-80"
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-4 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.full_name ?? '—'}</td>
                  <td className="p-3">{r.email ?? '—'}</td>
                  <td className="p-3">{r.role ?? 'student'}</td>
                  <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center opacity-70">No students.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </AdminGuard>
  );
}
