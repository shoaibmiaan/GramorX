import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';
import { useLocale } from '@/lib/locale';
import { translateExplanation } from '@/lib/explanations';

type ReviewItem = {
  id: string; qNo: number; type: string; prompt: string;
  correct: any; user: any; isCorrect: boolean; explanation?: string;
};
type ReviewPayload = {
  title: string; attemptId: string; band: number;
  correctCount: number; total: number;
  items: ReviewItem[];
  breakdown?: Record<string, { correct:number; total:number; pct:number }>;
};

export default function ReadingReviewPage() {
  const router = useRouter();
  const { attemptId } = router.query as { attemptId?: string };
  const [data, setData] = useState<ReviewPayload | null>(null);
  const [err, setErr] = useState<string | undefined>();
  const [explainBusy, setExplainBusy] = useState<string | null>(null);
  const { explanationLocale } = useLocale();

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      try {
        const res = await fetch(`/api/reading/review/${attemptId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load review');
        setData(json);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load review');
      }
    })();
  }, [attemptId]);

  async function explain(qid: string) {
    try {
      setExplainBusy(qid);
      const res = await fetch('/api/reading/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, qid })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not fetch explanation');
      const text = await translateExplanation(json.text, explanationLocale);
      setData(prev => !prev ? prev : ({
        ...prev,
        items: prev.items.map(i => i.id === qid ? { ...i, explanation: text } : i)
      }));
    } catch (e:any) {
      setErr(e?.message || 'Explain failed');
    } finally {
      setExplainBusy(null);
    }
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        {!data ? (
          err ? <Alert variant="error" title="Error">{err}</Alert> : (
            <Card className="p-6"><div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" /></Card>
          )
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <h1 className="font-slab text-4xl text-gradient-primary">{data.title} — Review</h1>
              <div className="flex items-center gap-2">
                <Badge variant="success">Band {data.band.toFixed(1)}</Badge>
                <Badge variant="info">{data.correctCount}/{data.total} correct</Badge>
                <Button variant="secondary" className="rounded-ds" onClick={() => router.push('/reading')}>Back to Reading</Button>
              </div>
            </div>

            {/* Per-type stats */}
            {data.breakdown && (
              <Card className="p-6 mt-6">
                <h3 className="text-h3 font-semibold mb-2">Performance by question type</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(data.breakdown).map(([type, b]) => (
                    <div key={type} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="font-medium uppercase">{type}</div>
                        <Badge variant={b.pct >= 70 ? 'success' : b.pct >= 40 ? 'warning' : 'danger'} size="sm">{b.pct}%</Badge>
                      </div>
                      <div className="text-small text-grayish mt-1">{b.correct}/{b.total} correct</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="mt-6 grid gap-6">
              {data.items.map(item => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-small text-grayish">Q{item.qNo} — {item.type.toUpperCase()}</div>
                    <Badge variant={item.isCorrect ? 'success' : 'danger'}>{item.isCorrect ? 'Correct' : 'Incorrect'}</Badge>
                  </div>
                  <p className="mt-2 font-medium">{item.prompt}</p>
                  <div className="mt-3 grid gap-2">
                    <div><span className="text-small text-grayish">Your answer:</span> <span>{renderVal(item.user)}</span></div>
                    <div><span className="text-small text-grayish">Correct answer:</span> <span>{renderVal(item.correct)}</span></div>
                  </div>
                  <div className="mt-4">
                    {item.explanation ? (
                      <Alert variant="info" title="Explanation">{item.explanation}</Alert>
                    ) : (
                      <Button
                        variant="primary"
                        className="rounded-ds"
                        onClick={() => explain(item.id)}
                        disabled={explainBusy === item.id}
                      >
                        {explainBusy === item.id ? 'Thinking…' : 'AI explanation'}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

function renderVal(v:any) {
  if (v == null) return <em className="text-grayish">—</em>;
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}
