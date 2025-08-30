import Head from 'next/head';
import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { trackUsage, trackHeatmap } from '@/lib/analytics';

interface TestPaper { id: string; title: string; status: 'pending' | 'approved' | 'rejected'; }

export default function AdminTests() {
  const [tests, setTests] = useState<TestPaper[]>([
    { id: 't1', title: 'Demo Paper 1', status: 'pending' },
    { id: 't2', title: 'Demo Paper 2', status: 'pending' },
  ]);

  useEffect(() => {
    trackUsage('admin_tests');
    trackHeatmap('admin_tests');
  }, []);

  function update(id: string, status: 'approved' | 'rejected') {
    setTests(t => t.map(p => (p.id === id ? { ...p, status } : p)));
  }

  return (
    <AdminGuard>
      <Head><title>Admin · Test Approval</title></Head>
      <Container className="py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Test Paper Approval</h1>
        <div className="space-y-4">
          {tests.map(t => (
            <div key={t.id} className="flex items-center justify-between border rounded px-4 py-2">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm opacity-70">Status: {t.status}</div>
              </div>
              {t.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={() => update(t.id, 'approved')}>Approve</Button>
                  <Button variant="secondary" onClick={() => update(t.id, 'rejected')}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </AdminGuard>
  );
}
