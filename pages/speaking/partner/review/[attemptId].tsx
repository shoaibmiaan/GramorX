// pages/speaking/partner/review/[attemptId].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';

type ReviewPayload = {
  attemptId: string;
  feedback: string | null;
  transcript: string | null;
  feedbackAt: string | null;
  transcriptAt: string | null;
};
const isUuid = (v: any) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default function PartnerReview() {
  const router = useRouter();
  const { attemptId } = router.query as { attemptId?: string };

  const [data, setData] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (!isUuid(attemptId)) {
      setLoading(false);
      setErr('Invalid or missing attempt id');
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await fetch(`/api/speaking/partner/review/${attemptId}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'Failed to load review');
        setData(j);
      } catch (e: any) {
        setErr(e.message || 'Failed to load review');
      } finally {
        setLoading(false);
      }
    })();
  }, [router.isReady, attemptId]);

  return (
    <Container className="py-10">
      <h1 className="text-4xl font-semibold mb-8">Partner Review</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feedback card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Feedback</h2>
            {data?.feedbackAt && (
              <Badge variant="subtle">Updated {new Date(data.feedbackAt).toLocaleString()}</Badge>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse h-24 rounded-xl bg-black/5 dark:bg-white/10" />
          ) : err ? (
            <div className="text-sm px-3 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-300">
              {err}
            </div>
          ) : data?.feedback ? (
            <p className="leading-7 whitespace-pre-wrap">{data.feedback}</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No feedback yet.</p>
          )}

          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.push('/speaking')}>Close</Button>
            <Button variant="secondary" onClick={() => router.push('/speaking/partner/history')}>
              History
            </Button>
          </div>
        </Card>

        {/* Transcript card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Transcript (latest)</h2>
            {data?.transcriptAt && (
              <Badge variant="subtle">Updated {new Date(data.transcriptAt).toLocaleString()}</Badge>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse h-40 rounded-xl bg-black/5 dark:bg-white/10" />
          ) : err ? (
            <p className="text-sm px-3 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-300">
              {err}
            </p>
          ) : data?.transcript ? (
            <pre className="leading-7 whitespace-pre-wrap">{data.transcript}</pre>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No transcript saved yet.</p>
          )}
        </Card>
      </div>
    </Container>
  );
}
