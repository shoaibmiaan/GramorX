import Head from 'next/head';
import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { trackUsage, trackHeatmap } from '@/lib/analytics';

interface Sub { id: string; user: string; plan: string; status: 'active' | 'canceled'; }

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([
    { id: 's1', user: 'Alice', plan: 'Pro', status: 'active' },
    { id: 's2', user: 'Bob', plan: 'Basic', status: 'canceled' },
  ]);

  useEffect(() => {
    trackUsage('admin_subscriptions');
    trackHeatmap('admin_subscriptions');
  }, []);

  function cancel(id: string) {
    setSubs(s => s.map(sub => (sub.id === id ? { ...sub, status: 'canceled' } : sub)));
  }

  return (
    <AdminGuard>
      <Head><title>Admin · Subscriptions</title></Head>
      <Container className="py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <div className="space-y-4">
          {subs.map(s => (
            <div key={s.id} className="flex items-center justify-between border rounded px-4 py-2">
              <div>
                <div className="font-medium">{s.user}</div>
                <div className="text-sm opacity-70">{s.plan} — {s.status}</div>
              </div>
              {s.status === 'active' && (
                <Button variant="secondary" onClick={() => cancel(s.id)}>Cancel</Button>
              )}
            </div>
          ))}
        </div>
      </Container>
    </AdminGuard>
  );
}
