import Head from 'next/head';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Container } from '@/components/design-system/Container';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { trackUsage, trackHeatmap } from '@/lib/analytics';

interface Metric { name: string; value: number; }

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    trackUsage('admin_dashboard');
    trackHeatmap('admin_dashboard');
  }, []);

  useEffect(() => {
    const channel = supabaseBrowser.channel('admin-metrics')
      .on('broadcast', { event: 'update' }, payload => {
        const next = payload.payload.metrics as Metric[] | undefined;
        if (next) setMetrics(next);
      })
      .subscribe();
    return () => { supabaseBrowser.removeChannel(channel); };
  }, []);

  return (
    <AdminGuard>
      <Head><title>Admin · Dashboard</title></Head>
      <Container className="py-8">
        <h1 className="text-2xl font-semibold mb-6">Real-time Metrics</h1>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {metrics.map(m => (
            <div key={m.name} className="rounded-xl border p-4">
              <div className="text-sm opacity-70">{m.name}</div>
              <div className="text-2xl font-bold">{m.value}</div>
            </div>
          ))}
          {metrics.length === 0 && <p>No metrics yet.</p>}
        </div>
      </Container>
    </AdminGuard>
  );
}
