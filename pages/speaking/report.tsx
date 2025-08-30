import React, { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Breakdown = { fluency?: number; lexical?: number; grammar?: number; pronunciation?: number };
type Attempt = { id: string; created_at: string; band_overall: number | null; band_breakdown: Breakdown | null };

export default function SpeakingReportPage() {
  const [rows, setRows] = useState<Attempt[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabaseBrowser
          .from('speaking_attempts')
          .select('id, created_at, band_overall, band_breakdown')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw new Error(error.message);
        setRows((data || []) as Attempt[]);
      } catch (e: any) {
        setError(e.message || 'Failed to load report');
      }
    })();
  }, []);

  const agg = useMemo(() => {
    const base = { sum: 0, count: 0 };
    const out = {
      fluency: { ...base },
      lexical: { ...base },
      grammar: { ...base },
      pronunciation: { ...base },
    };
    rows.forEach(r => {
      const b = r.band_breakdown || {};
      (['fluency','lexical','grammar','pronunciation'] as const).forEach(k => {
        const v = (b as any)[k];
        if (typeof v === 'number') { out[k].sum += v; out[k].count += 1; }
      });
    });
    const avg = (k: keyof typeof out) => out[k].count ? (out[k].sum / out[k].count).toFixed(1) : '—';
    return {
      fluency: avg('fluency'),
      lexical: avg('lexical'),
      grammar: avg('grammar'),
      pronunciation: avg('pronunciation'),
    };
  }, [rows]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 md:text-display mb-6">Speaking Report</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <Card className="card-surface p-6 rounded-ds-2xl">
          <h2 className="text-h3 mb-4">Averages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Badge variant="secondary" className="rounded-ds-xl justify-center">Fluency: {agg.fluency}</Badge>
            <Badge variant="secondary" className="rounded-ds-xl justify-center">Vocabulary: {agg.lexical}</Badge>
            <Badge variant="secondary" className="rounded-ds-xl justify-center">Grammar: {agg.grammar}</Badge>
            <Badge variant="secondary" className="rounded-ds-xl justify-center">Pronunciation: {agg.pronunciation}</Badge>
          </div>

          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Overall</th>
                <th className="pb-2">Fluency</th>
                <th className="pb-2">Vocab</th>
                <th className="pb-2">Grammar</th>
                <th className="pb-2">Pron.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const b = r.band_breakdown || {};
                return (
                  <tr key={r.id} className="border-t border-black/10 dark:border-white/10">
                    <td className="py-2 pr-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-2">{r.band_overall ?? '—'}</td>
                    <td className="py-2 pr-2">{b.fluency ?? '—'}</td>
                    <td className="py-2 pr-2">{b.lexical ?? '—'}</td>
                    <td className="py-2 pr-2">{b.grammar ?? '—'}</td>
                    <td className="py-2 pr-2">{b.pronunciation ?? '—'}</td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr><td className="pt-4" colSpan={6}>No attempts yet.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </Container>
    </section>
  );
}

