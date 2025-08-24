// pages/admin/content/reading.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Container } from '@/components/design-system/Container';

type ReadingTest = {
  id: string;
  title: string;
  level: string | null;
  created_at: string;
};

export default function ReadingContent() {
  const [tests, setTests] = useState<ReadingTest[]>([]);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Academic');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data, error } = await supabaseBrowser
      .from('reading_tests')
      .select('id,title,level,created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setTests(data as ReadingTest[]);
  };

  useEffect(() => { refresh(); }, []);

  const createTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const { data: userData } = await supabaseBrowser.auth.getUser();
    const created_by = userData?.user?.id ?? null;
    const { error } = await supabaseBrowser.from('reading_tests').insert([{ title, level, created_by }]);
    setBusy(false);
    if (!error) {
      setTitle('');
      setLevel('Academic');
      await refresh();
    } else {
      alert(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this test?')) return;
    const { error } = await supabaseBrowser.from('reading_tests').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    await refresh();
  };

  return (
    <AdminGuard>
      <Head><title>Admin · Reading Content</title></Head>
      <Container className="py-8">
        <h1 className="text-2xl font-semibold mb-6">Reading — Tests</h1>

        <form onSubmit={createTest} className="rounded-2xl border p-4 grid gap-3 sm:grid-cols-3">
          <input
            className="sm:col-span-2 rounded-xl border px-3 py-2 bg-transparent"
            placeholder="Test title (e.g., Academic Demo 01)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2 bg-transparent"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option>Academic</option>
            <option>General</option>
            <option>A1</option><option>A2</option>
            <option>B1</option><option>B2</option>
            <option>C1</option><option>C2</option>
          </select>
          <div className="sm:col-span-3 flex justify-end">
            <button
              disabled={busy}
              className="rounded-xl border px-4 py-2 hover:shadow-sm disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'Create Test'}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Level</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.title}</td>
                  <td className="p-3">{t.level}</td>
                  <td className="p-3">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    {/* Future: Edit builder for passages/questions */}
                    <button
                      onClick={() => remove(t.id)}
                      className="rounded-lg border px-3 py-1 hover:shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center opacity-70">No tests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </AdminGuard>
  );
}
