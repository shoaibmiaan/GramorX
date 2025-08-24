// pages/speaking/attempts/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';

type AttemptRow = {
  id: string;
  section: 'part1' | 'part2' | 'part3';
  overall: number | null;
  created_at: string;
  duration_sec: number | null;
};

export default function SpeakingAttemptsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AttemptRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  const hasMore = useMemo(() => items.length < total, [items.length, total]);

  async function load(nextOffset = 0) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/speaking/attempts?limit=${limit}&offset=${nextOffset}`);
      if (!res.ok) throw new Error(`Failed to load attempts (${res.status})`);
      const data = await res.json();
      setTotal(data.total ?? 0);
      if (nextOffset === 0) setItems(data.items ?? []);
      else setItems((prev) => [...prev, ...(data.items ?? [])]);
      setOffset(nextOffset);
    } catch (e: any) {
      setError(e.message || 'Error loading attempts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head><title>Speaking Attempts</title></Head>
      <Container className="py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold">Speaking Attempts</h1>
          <div className="flex gap-2">
            <Link href="/speaking/simulator/part2" className="px-4 py-2 rounded-xl bg-emerald-600 text-white">
              Start Part 2
            </Link>
            <Link href="/speaking/simulator" className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10">
              Open Simulator
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Overall</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-gray-100 dark:border-white/10">
                  <td className="px-4 py-3">{new Date(a.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 uppercase">{a.section.replace('part', 'Part ')}</td>
                  <td className="px-4 py-3 font-medium">{a.overall ?? '—'}</td>
                  <td className="px-4 py-3">
                    {a.duration_sec ? `${Math.floor(a.duration_sec / 60)}m ${a.duration_sec % 60}s` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/speaking/review/${a.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No attempts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {error && <p className="mt-3 text-rose-600 text-sm">{error}</p>}

        <div className="mt-4 flex justify-center">
          {hasMore && (
            <button
              onClick={() => load(offset + limit)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10"
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </Container>
    </>
  );
}
