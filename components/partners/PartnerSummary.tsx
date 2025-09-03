// components/partners/PartnerSummary.tsx
import * as React from 'react';
import { getPartnerSummary, type PartnerSummary } from '@/lib/api/partners';

type Props = { className?: string };

export default function PartnerSummary({ className = '' }: Props) {
  const [data, setData] = React.useState<PartnerSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    const res = await getPartnerSummary();
    if ('ok' in res && res.ok) setData(res.summary);
    else setErr((res as any)?.error || 'Failed to load summary');
    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={`rounded-xl border border-border p-4 ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">Partner Summary</h2>
        <button onClick={load} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Refresh
        </button>
      </header>

      {loading ? (
        <p>Loading…</p>
      ) : err ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Error</p><p className="opacity-90">{err}</p>
        </div>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground">Signups</p>
              <p className="text-2xl font-semibold">{data.totalSignups}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-semibold">{data.totalApproved}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="text-2xl font-semibold">{data.totalClicks}</p>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">Top Codes</h3>
          {data.topCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No redemptions yet.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4">Code</th>
                    <th className="py-2 pr-4">Approved</th>
                    <th className="py-2 pr-4">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCodes.map((row) => (
                    <tr key={row.code} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-mono">{row.code}</td>
                      <td className="py-2 pr-4">{row.approved}</td>
                      <td className="py-2 pr-4">{row.pending}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
