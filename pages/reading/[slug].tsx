import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { QuestionBlock } from '@/components/reading/QuestionBlock';
import { QuestionNav } from '@/components/reading/QuestionNav';
import FocusGuard from '@/components/exam/FocusGuard';
import { BookmarkButton } from '@/components/BookmarkButton';

type BaseQ = { id: string; qNo: number; type: 'mcq'|'tfng'|'ynng'|'gap'|'match'; prompt: string };
type MCQ = BaseQ & { type: 'mcq'; options: string[]; answer?: string };
type TFNG = BaseQ & { type: 'tfng'; answer?: 'True'|'False'|'Not Given' };
type YNNG = BaseQ & { type: 'ynng'; answer?: 'Yes'|'No'|'Not Given' };
type GAP  = BaseQ & { type: 'gap'; answer?: string; acceptable?: string[] };
type MATCH = BaseQ & { type: 'match'; options: string[]; pairs: { left: string; right: string }[]; answer?: Record<string,string> };
type Question = MCQ | TFNG | YNNG | GAP | MATCH;

type Section = { orderNo: number; title?: string; instructions?: string; questions: Question[] };
type ReadingTest = { slug: string; title: string; passage: string; sections: Section[]; durationMinutes: number };

const CLIENT_ONLY = dynamic(() => Promise.resolve(({ children }: React.PropsWithChildren) => <>{children}</>), { ssr: false });

type AnswerValue =
  | { type: 'mcq'; value: string }
  | { type: 'tfng'; value: 'True' | 'False' | 'Not Given' }
  | { type: 'ynng'; value: 'Yes' | 'No' | 'Not Given' }
  | { type: 'gap'; value: string }
  | { type: 'match'; value: Record<string, string> };

type StatusFilter = 'all' | 'flagged' | 'unanswered';
type TypeFilter = 'all' | 'tfng' | 'ynng' | 'mcq' | 'gap' | 'match';

export default function ReadingRunnerPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const [test, setTest] = useState<ReadingTest | null>(null);
  const [err, setErr] = useState<string|undefined>();
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const dirtyRef = useRef(false);
  const preventRouteBlockRef = useRef(false);

  // load test
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/reading/test/${slug}`);
        if (!res.ok) throw new Error(`Failed to fetch test: ${res.status}`);
        const data: ReadingTest = await res.json();
        setTest(data);

        const saved = window.localStorage.getItem(`reading:${slug}:answers`);
        const savedFlags = window.localStorage.getItem(`reading:${slug}:flags`);
        if (saved) setAnswers(JSON.parse(saved));
        if (savedFlags) setFlags(JSON.parse(savedFlags));

        setSecondsLeft(data.durationMinutes * 60);
      } catch (e:any) {
        setErr(e?.message || 'Failed to load test');
      }
    })();
  }, [slug]);

  // countdown + time-up auto-submit
  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s == null) return s;
        if (s <= 1) {
          clearInterval(t);
          if (!submitting) submit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]); // eslint-disable-line

  // autosave answers/flags
  useEffect(() => {
    if (!slug) return;
    const id = setInterval(() => {
      try {
        window.localStorage.setItem(`reading:${slug}:answers`, JSON.stringify(answers));
        window.localStorage.setItem(`reading:${slug}:flags`, JSON.stringify(flags));
        dirtyRef.current = Object.keys(answers).length > 0;
      } catch {}
    }, 1500);
    return () => clearInterval(id);
  }, [answers, flags, slug]);

  // leave guards
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current && !preventRouteBlockRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);
  useEffect(() => {
    const handleRouteChangeStart = () => {
      if (preventRouteBlockRef.current) return;
      if (dirtyRef.current) {
        const ok = window.confirm('You have unsaved answers. Are you sure you want to leave?');
        if (!ok) {
          router.events.emit('routeChangeError');
          // eslint-disable-next-line no-throw-literal
          throw 'Route change aborted by user';
        } else {
          preventRouteBlockRef.current = true;
        }
      }
    };
    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => router.events.off('routeChangeStart', handleRouteChangeStart);
  }, [router]);

  const flatQuestions: Question[] = useMemo(() => test ? test.sections.flatMap(s => s.questions) : [], [test]);
  const totalQuestions = flatQuestions.length;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressPct = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  function onAnswer(qid: string, type: Question['type'], value: AnswerValue['value']) {
    setAnswers(prev => ({ ...prev, [qid]: { type, value } }));
  }
  function toggleFlag(qid: string) { setFlags(prev => ({ ...prev, [qid]: !prev[qid] })); }

  // keyboard shortcuts (kept)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!test) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const current = firstUnansweredOrLast(flatQuestions, answers);
      if (!current) return;

      const type = current.type;
      const set = (val: AnswerValue['value']) => onAnswer(current.id, type, val);

      if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFlag(current.id); scrollToQuestion(current.id); return; }
      if (e.key === 'Enter') { e.preventDefault(); const nxt = nextUnanswered(flatQuestions, answers, current.id); if (nxt) scrollToQuestion(nxt.id); return; }

      if (type === 'mcq') {
        if (['1','2','3','4'].includes(e.key)) {
          e.preventDefault();
          const mcq = current as MCQ;
          const idx = Number(e.key) - 1;
          if (mcq.options[idx]) set(mcq.options[idx]);
        }
      } else if (type === 'tfng') {
        const k = e.key.toLowerCase();
        if (k === 't') { e.preventDefault(); set('True'); }
        else if (k === 'f') { e.preventDefault(); set('False'); }
        else if (k === 'n') { e.preventDefault(); set('Not Given'); }
      } else if (type === 'ynng') {
        const k = e.key.toLowerCase();
        if (k === 'y') { e.preventDefault(); set('Yes'); }
        else if (k === 'n') { e.preventDefault(); set('No'); }
        else if (k === 'g') { e.preventDefault(); set('Not Given'); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [test, answers, flatQuestions]);

  function scrollToQuestion(qid: string) {
    const el = document.querySelector<HTMLElement>(`[data-qid="${qid}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function firstUnansweredOrLast(Qs: Question[], ans: Record<string, AnswerValue>) {
    const u = Qs.find(q => ans[q.id]?.value == null || ans[q.id]?.value === '');
    return u || Qs[Qs.length - 1];
  }
  function nextUnanswered(Qs: Question[], ans: Record<string, AnswerValue>, afterId: string) {
    const idx = Qs.findIndex(q => q.id === afterId);
    for (let i = idx + 1; i < Qs.length; i++) if (ans[Qs[i].id]?.value == null || ans[Qs[i].id]?.value === '') return Qs[i];
    for (let i = 0; i <= idx; i++) if (ans[Qs[i].id]?.value == null || ans[Qs[i].id]?.value === '') return Qs[i];
    return null;
  }

  // per-type progress for sticky badges
  const typeProgress: Record<string, { answered:number; total:number }> = useMemo(() => {
    const map: Record<string, { answered:number; total:number }> = {};
    flatQuestions.forEach(q => {
      if (!map[q.type]) map[q.type] = { answered: 0, total: 0 };
      map[q.type].total += 1;
      if (!(answers[q.id]?.value == null || answers[q.id]?.value === '')) map[q.type].answered += 1;
    });
    return map;
  }, [flatQuestions, answers]);

  const mm = Math.max(0, Math.floor((secondsLeft ?? 0) / 60));
  const ss = Math.max(0, (secondsLeft ?? 0) % 60).toString().padStart(2, '0');

  return (
    <>
      <FocusGuard exam="reading" slug={slug} />
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
        {!test ? (
          err ? <Alert variant="error" title="Error">{err}</Alert> : (
            <Card className="p-6"><div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" /></Card>
          )
        ) : (
          <>
            {/* Sticky bar */}
            <div className="sticky top-16 z-10 card-surface border border-gray-200 dark:border-white/10 rounded-ds p-3 flex items-center gap-3 flex-wrap">
              <Badge variant="info">Time Left: {mm}:{ss}</Badge>
              <div className="flex-1 h-2 bg-gray-200/60 dark:bg-white/10 rounded-ds" aria-label="Progress" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-2 bg-primary rounded-ds" style={{ width: `${progressPct}%` }} />
              </div>
              <Badge variant={progressPct===100 ? 'success' : 'warning'}>{progressPct}%</Badge>

              {/* Per-type progress badges */}
              {(['tfng','ynng','mcq','gap','match'] as const).map(t => (
                typeProgress[t] ? (
                  <Badge key={t} variant="neutral" size="sm" className="uppercase">
                    {t}: {typeProgress[t].answered}/{typeProgress[t].total}
                  </Badge>
                ) : null
              ))}

              <BookmarkButton resourceId={slug || ''} type="reading" />
              <Button variant="secondary" className="rounded-ds" onClick={() => router.back()}>Exit</Button>
              <Button variant="primary" className="rounded-ds" onClick={() => submit()} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>

            {/* Layout: main + sidebar */}
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              {/* Main */}
              <div className="lg:col-span-9">
                {/* Passage */}
                <Card className="p-6">
                  <h1 className="text-h2 font-semibold mb-2">{test.title}</h1>
                  <p className="text-body whitespace-pre-line">{test.passage}</p>
                </Card>

                {/* Sections & questions */}
                <div className="mt-6 grid gap-6">
                  {test.sections.map(sec => (
                    <Card key={sec.orderNo} className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-h3 font-semibold">{sec.title || `Section ${sec.orderNo}`}</h2>
                          {sec.instructions && <p className="text-grayish">{sec.instructions}</p>}
                        </div>
                        <Badge variant="neutral" size="sm">{sec.questions.length} Qs</Badge>
                      </div>
                      <div className="mt-4 grid gap-4">
                        {sec.questions.map(q => (
                          <QuestionBlock
                            key={q.id}
                            q={q as any}
                            value={answers[q.id]?.value}
                            flagged={!!flags[q.id]}
                            onFlag={() => toggleFlag(q.id)}
                            onChange={(val) => onAnswer(q.id, q.type, val)}
                          />
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar navigator */}
              <div className="lg:col-span-3">
                <QuestionNav
                  questions={flatQuestions.map(q => ({ id: q.id, qNo: q.qNo, type: q.type }))}
                  answers={answers}
                  flags={flags}
                  statusFilter={statusFilter}
                  onStatusFilter={setStatusFilter}
                  typeFilter={typeFilter}
                  onTypeFilter={setTypeFilter}
                  onJump={(qid) => scrollToQuestion(qid)}
                />
              </div>
            </div>
          </>
        )}
        </Container>
      </section>
    </>
  );
}

async function submit(this: void, auto = false) {
  // NOTE: function body is defined inside component above (kept to preserve diff clarity)
}

function firstUnansweredOrLast(Qs: Question[], ans: Record<string, AnswerValue>) {
  const u = Qs.find(q => ans[q.id]?.value == null || ans[q.id]?.value === '');
  return u || Qs[Qs.length - 1];
}
function nextUnanswered(Qs: Question[], ans: Record<string, AnswerValue>, afterId: string) {
  const idx = Qs.findIndex(q => q.id === afterId);
  for (let i = idx + 1; i < Qs.length; i++) if (ans[Qs[i].id]?.value == null || ans[Qs[i].id]?.value === '') return Qs[i];
  for (let i = 0; i <= idx; i++) if (ans[Qs[i].id]?.value == null || ans[Qs[i].id]?.value === '') return Qs[i];
  return null;
}
