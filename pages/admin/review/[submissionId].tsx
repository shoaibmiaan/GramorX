import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { trackUsage, trackHeatmap } from '@/lib/analytics';

interface Submission {
  id: string;
  student_name: string;
  ai_score: number;
  final_score?: number | null;
  override_comment?: string | null;
}

export default function ReviewSubmission() {
  const router = useRouter();
  const { submissionId } = router.query as { submissionId?: string };
  const [data, setData] = useState<Submission | null>(null);
  const [finalScore, setFinalScore] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackUsage('admin_review');
    trackHeatmap('admin_review');
  }, []);

  useEffect(() => {
    if (!submissionId) return;
    (async () => {
      const res = await fetch(`/api/admin/review?submissionId=${submissionId}`);
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        setFinalScore(json.data.final_score?.toString() ?? '');
        setComment(json.data.override_comment ?? '');
      } else {
        setError(json.error || 'Failed to load');
      }
    })();
  }, [submissionId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!submissionId) return;
    const score = Number(finalScore);
    if (Number.isNaN(score)) {
      setError('Invalid score');
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/review/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, final_score: score, comment }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.ok) {
      setError(json.error || 'Failed to save');
    } else {
      setData(prev => prev ? { ...prev, final_score: score, override_comment: comment } : prev);
    }
  }

  return (
    <AdminGuard>
      <Head><title>Admin · Review Submission</title></Head>
      <Container className="py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Review Submission</h1>
        {error && <p className="text-red-600">{error}</p>}
        {!data && <p>Loading…</p>}
        {data && (
          <div className="space-y-4">
            <div>Student: <b>{data.student_name}</b></div>
            <div>AI Score: <b>{data.ai_score}</b></div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Final Score</label>
                <input value={finalScore} onChange={e => setFinalScore(e.target.value)} className="border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm mb-1">Reason</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} className="border rounded w-full px-2 py-1" />
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Override'}</Button>
            </form>
          </div>
        )}
      </Container>
    </AdminGuard>
  );
}
