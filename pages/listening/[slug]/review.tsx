import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';

type Q = {
  id: string;
  qNo: number;
  type: 'mcq' | 'gap';
  prompt: string;
  options?: string[] | null;
  answer: string;
  sectionOrder: number;
};

export default function ListeningReviewPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [ua, setUa] = useState<Record<number, string>>({});
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  // Global compare toggle
  const [compare, setCompare] = useState(false);

  // Print: scope to review area
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!slug || !userId) return;
    (async () => {
      setLoading(true);
      const [tRes, qRes, aRes, sRes] = await Promise.all([
        supabase.from('lm_listening_tests').select('title').eq('slug', slug).single(),
        supabase
          .from('lm_listening_questions')
          .select('id,q_no,type,prompt,options,answer,section_order')
          .eq('test_slug', slug)
          .order('q_no'),
        supabase
          .from('lm_listening_user_answers')
          .select('q_no,answer')
          .eq('test_slug', slug)
          .eq('user_id', userId),
        supabase
          .from('lm_listening_sections')
          .select('order_no,transcript')
          .eq('test_slug', slug)
          .order('order_no'),
      ]);

      setTitle(tRes.data?.title ?? 'Listening Review');

      setQuestions(
        (qRes.data ?? []).map((q) => ({
          id: q.id,
          qNo: q.q_no,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          sectionOrder: q.section_order,
        }))
      );

      setUa(Object.fromEntries((aRes.data ?? []).map((r) => [r.q_no, r.answer])));

      const tmap: Record<number, string> = {};
      (sRes.data ?? []).forEach((s) => {
        tmap[s.order_no] = s.transcript ?? '';
      });
      setTranscripts(tmap);

      setLoading(false);
    })();
  }, [slug, userId]);

  const normalize = (s: string) => s?.toString().replace(/\s+/g, ' ').trim().toLowerCase();

  const result = useMemo(() => {
    if (!questions.length) return { correct: 0, total: 0, pct: 0 };
    let correct = 0;
    for (const q of questions) {
      const userAns = ua[q.qNo] ?? '';
      const ok = q.type === 'mcq' ? userAns === q.answer : normalize(userAns) === normalize(q.answer);
      if (ok) correct++;
    }
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    return { correct, total, pct };
  }, [questions, ua]);

  const approxBand = (raw: number) => {
    if (raw >= 39) return 9.0;
    if (raw >= 37) return 8.5;
    if (raw >= 35) return 8.0;
    if (raw >= 32) return 7.5;
    if (raw >= 30) return 7.0;
    if (raw >= 26) return 6.5;
    if (raw >= 23) return 6.0;
    if (raw >= 18) return 5.5;
    if (raw >= 16) return 5.0;
    if (raw >= 13) return 4.5;
    return 4.0;
  };

  // Highlight helpers (token-based styles; no hex)
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text: string, needle: string, cls: string) => {
    if (!text || !needle) return <>{text}</>;
    const re = new RegExp(`(${escapeRegExp(needle)})`, 'ig');
    const parts = text.split(re);
    return (
      <>
        {parts.map((part, i) =>
          re.test(part) ? (
            <span key={i} className={`rounded-ds px-1 ${cls}`}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const renderTranscript = (raw: string, correct: string, user: string) => {
    if (!raw) return <em className="opacity-70">No transcript for this section.</em>;
    const ok = normalize(user) === normalize(correct);

    if (!ok && user) {
      return (
        <div className="space-y-2">
          <div className="text-small opacity-80">
            <span className="rounded-ds px-1 bg-success/15 text-success mr-2">Correct</span>
            <span className="rounded-ds px-1 bg-sunsetOrange/20 text-sunsetOrange">Your answer</span>
          </div>
          <p className="opacity-90">{highlight(raw, correct, 'bg-success/15 text-success')}</p>
          <p className="opacity-90">{highlight(raw, user, 'bg-sunsetOrange/20 text-sunsetOrange')}</p>
        </div>
      );
    }

    return <p className="opacity-90">{highlight(raw, correct, 'bg-success/15 text-success')}</p>;
  };

  if (loading) {
    return (
      <section className="py-24">
        <Container>
          <Card className="p-6">
            <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
          </Card>
        </Container>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="py-24">
        <Container>
          <Alert variant="info" title="Sign in required">
            Please sign in to see your saved review.
          </Alert>
          <div className="mt-6">
            <Button as="a" href="/login">
              Go to Login
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      {/* Print styles scoped to review area */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area,
          #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            inset: 0;
            padding: 0 16px;
          }
          a[href]:after {
            content: '';
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Container id="print-area" ref={printRef}>
        <div className="flex items-center justify-between gap-4 no-print">
          <div>
            <h1 className="font-slab text-4xl text-gradient-primary">{title}</h1>
            <p className="text-grayish">Per-question feedback • Transcript comparison • Exportable PDF</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCompare((v) => !v)}>
              {compare ? 'Hide transcript compare' : 'Compare vs transcript'}
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              Export PDF
            </Button>
            <Button variant="secondary" as="a" href={`/listening/${slug}`}>
              Retake
            </Button>
            <Button variant="secondary" as="a" href="/listening">
              Back
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="p-6 mt-8">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="success">
              Correct: {result.correct} / {result.total}
            </Badge>
            <Badge variant="info">Accuracy: {result.pct}%</Badge>
            <Badge variant="warning">Band (approx): {approxBand(result.correct).toFixed(1)}</Badge>
          </div>
        </Card>

        {/* Per-question review */}
        <div className="grid gap-6 mt-8 md:grid-cols-2">
          {questions.map((q) => {
            const userAns = ua[q.qNo] ?? '';
            const ok = q.type === 'mcq' ? userAns === q.answer : normalize(userAns) === normalize(q.answer);
            const transcript = transcripts[q.sectionOrder] ?? '';
            return (
              <Card key={q.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">
                    Q{q.qNo}. {q.prompt}
                  </h3>
                  <Badge variant={ok ? 'success' : 'danger'} size="sm">
                    {ok ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>

                {q.type === 'mcq' ? (
                  <ul className="mt-4 grid gap-2">
                    {(q.options ?? []).map((opt) => {
                      const isCorrect = opt === q.answer;
                      const isChosen = opt === userAns;
                      const show = isCorrect || isChosen;
                      const cls = show
                        ? isCorrect
                          ? 'border-success/50 bg-success/10'
                          : 'border-sunsetOrange/50 bg-sunsetOrange/10'
                        : 'border-gray-200 dark:border-white/10';
                      return (
                        <li key={opt} className={`p-3.5 rounded-ds border ${cls}`}>
                          {opt}
                          {isCorrect && <i className="fas fa-check-circle ml-2 text-success" aria-hidden />}
                          {isChosen && !isCorrect && (
                            <i className="fas fa-times-circle ml-2 text-sunsetOrange" aria-hidden />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-4 space-y-2">
                    {ok ? (
                      <Alert variant="success">
                        <strong>Your answer:</strong> {userAns}
                      </Alert>
                    ) : (
                      <>
                        <Alert variant="error">
                          <strong>Your answer:</strong> {userAns || <em>(blank)</em>}
                        </Alert>
                        <Alert variant="info">
                          <strong>Correct:</strong> {q.answer}
                        </Alert>
                      </>
                    )}
                  </div>
                )}

                {/* Compare vs Transcript */}
                {compare && (
                  <div className="mt-5">
                    <div className="text-small font-semibold mb-1 opacity-80">
                      Transcript excerpt (Section {q.sectionOrder})
                    </div>
                    <Card className="p-4">
                      {renderTranscript(transcript, q.answer, userAns)}
                    </Card>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
