// pages/listening/[slug].tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { Input } from '@/components/design-system/Input';
import FocusGuard from '@/components/exam/FocusGuard';
import { Timer } from '@/components/design-system/Timer';
import { scoreAll } from '@/lib/listening/score';
import { rawToBand } from '@/lib/listening/band';

type MCQ = {
  id: string;
  qNo: number;
  type: 'mcq';
  prompt: string;
  options: string[];
  answer: string;
};
type GAP = {
  id: string;
  qNo: number;
  type: 'gap';
  prompt: string;
  answer: string;
};
type Question = MCQ | GAP;

type Section = {
  orderNo: number;
  startMs: number;
  endMs: number;
  transcript?: string;
  questions: Question[];
};

type ListeningTest = {
  slug: string;
  title: string;
  masterAudioUrl: string;
  sections: Section[];
};

const LS_KEY = (slug?: string) => (slug ? `listen:${slug}` : '');
const TOTAL_TIME_SEC = 30 * 60; // 30 minutes

export default function ListeningTestPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  // --- Auth state ---
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false); // gate UI until auth resolved

  // --- Test + UI state ---
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [checked, setChecked] = useState(false);

  // --- Save state ---
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // answers: questionId -> value
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // --- Timer ---
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SEC);
  const submittedRef = useRef(false);

  // --- Audio & timing ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const gapMsRef = useRef<number>(850); // 700–1000ms gap feels natural

  // --- Load auth user (robust and race-free) ---
  useEffect(() => {
    let mounted = true;

    // 1) Get current user (in case session already present)
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.user?.id ?? null);
      setAuthReady(true);
    });

    // 2) Subscribe to future changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      sub?.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  // --- Load test from DB ---
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const { data: t, error: tErr } = await supabase
        .from('lm_listening_tests')
        .select('slug,title,master_audio_url')
        .eq('slug', slug)
        .single();

      if (tErr || !t || cancelled) return;

      const { data: sections, error: sErr } = await supabase
        .from('lm_listening_sections')
        .select('order_no,start_ms,end_ms,transcript')
        .eq('test_slug', slug)
        .order('order_no', { ascending: true });

      if (sErr || cancelled) return;

      const { data: questions, error: qErr } = await supabase
        .from('lm_listening_questions')
        .select('id,q_no,type,prompt,options,answer,section_order')
        .eq('test_slug', slug)
        .order('q_no', { ascending: true });

      if (qErr || cancelled) return;

      const secMap = new Map<number, Section>();
      (sections ?? []).forEach((s) => {
        secMap.set(s.order_no, {
          orderNo: s.order_no,
          startMs: s.start_ms,
          endMs: s.end_ms,
          transcript: s.transcript ?? undefined,
          questions: [],
        });
      });

      (questions ?? []).forEach((q) => {
        const sec = secMap.get(q.section_order);
        if (!sec) return;
        if (q.type === 'mcq') {
          sec.questions.push({
            id: q.id,
            qNo: q.q_no,
            type: 'mcq',
            prompt: q.prompt,
            options: (q.options ?? []) as string[],
            answer: q.answer,
          });
        } else {
          sec.questions.push({
            id: q.id,
            qNo: q.q_no,
            type: 'gap',
            prompt: q.prompt,
            answer: q.answer,
          });
        }
      });

      const ordered = [...secMap.values()]
        .sort((a, b) => a.orderNo - b.orderNo)
        .map((s) => ({ ...s, questions: [...s.questions].sort((a, b) => a.qNo - b.qNo) }));

      if (!cancelled) {
        setTest({
          slug: t.slug,
          title: t.title,
          masterAudioUrl: t.master_audio_url,
          sections: ordered,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // --- Rehydrate WIP (answers + section) from localStorage ---
  useEffect(() => {
    if (!slug) return;
    try {
      const raw = localStorage.getItem(LS_KEY(slug));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { answers?: Record<string, string>; currentIdx?: number };
      if (parsed.answers) setAnswers(parsed.answers);
      if (typeof parsed.currentIdx === 'number') setCurrentIdx(Math.max(0, parsed.currentIdx));
    } catch {
      // ignore parse errors
    }
  }, [slug]);

  // --- Persist WIP to localStorage (light debounce) ---
  useEffect(() => {
    if (!slug) return;
    const id = window.setTimeout(() => {
      const payload = JSON.stringify({ answers, currentIdx });
      localStorage.setItem(LS_KEY(slug), payload);
    }, 250);
    return () => clearTimeout(id);
  }, [answers, currentIdx, slug]);

  // --- Audio slice auto-play + gap between sections ---
  useEffect(() => {
    const section = test?.sections[currentIdx] ?? null;
    if (!test || !section) return;

    const audio = audioRef.current;
    if (!audio) return;

    let advanceTimer: number | null = null;

    const seekToStart = () => {
      audio.currentTime = section.startMs / 1000;
      setReady(true);
      if (autoPlay) {
        audio.play().catch(() => {});
      }
    };

    const onLoaded = () => {
      seekToStart();
    };

    const onTimeUpdate = () => {
      const tMs = audio.currentTime * 1000;
      if (tMs >= section.endMs - 25) {
        audio.pause();
        if (autoPlay && currentIdx < test.sections.length - 1 && advanceTimer == null) {
          advanceTimer = window.setTimeout(() => {
            setCurrentIdx((i) => i + 1);
            advanceTimer = null;
          }, gapMsRef.current);
        }
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    // If metadata already available (when swapping slices on same src)
    if (audio.readyState >= 1) onLoaded();

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      if (advanceTimer) {
        clearTimeout(advanceTimer);
      }
    };
  }, [test, autoPlay, currentIdx]);

  // --- Answer helpers ---
  const handleMCQ = (q: MCQ, val: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };
  const handleGap = (q: GAP, val: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val.trim() }));
  };
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const isCorrect = (q: Question) => {
    const a = answers[q.id] ?? '';
    return q.type === 'mcq'
      ? a === (q as MCQ).answer
      : normalize(a) === normalize((q as GAP).answer);
  };

  // --- Persist answers to DB (user-scoped rows) ---
  const persistAnswers = async () => {
    if (!userId || !test) return;
    setSaving(true);
    setSaveError(null);
    try {
      const rows = Object.entries(answers)
        .map(([qid, ans]) => {
          const q = test.sections.flatMap((s) => s.questions).find((qq) => qq.id === qid);
          if (!q) return null;
          return { user_id: userId, test_slug: test.slug, q_no: q.qNo, answer: ans };
        })
        .filter(Boolean) as Array<{ user_id: string; test_slug: string; q_no: number; answer: string }>;

      if (rows.length === 0) return;

      const { error } = await supabase
        .from('lm_listening_user_answers')
        .upsert(rows, { onConflict: 'user_id,test_slug,q_no' });

      if (error) throw error;
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? 'Failed to save';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- Submit attempt via RPC (score + band) ---
  const submitAttempt = async () => {
    if (!test || !userId) return;
    const flat = test.sections.flatMap((s) => s.questions);
    const questionsForScore = flat.map((q) =>
      q.type === 'mcq'
        ? { qno: q.qNo, type: 'mcq', answer_key: { value: q.answer } }
        : { qno: q.qNo, type: 'gap', answer_key: { text: q.answer } }
    );
    const answersArr = Object.entries(answers)
      .map(([qid, ans]) => {
        const q = flat.find((qq) => qq.id === qid);
        if (!q) return null;
        return { qno: q.qNo, answer: ans };
      })
      .filter(Boolean) as { qno: number; answer: any }[];

    const { total, perSection } = scoreAll(questionsForScore as any, answersArr);
    const band = rawToBand(total);

    await supabase.rpc('save_listening_attempt', {
      test_slug: test.slug,
      answers: answersArr,
      score: total,
      band,
      section_scores: perSection,
      duration_sec: TOTAL_TIME_SEC - Math.ceil(timeLeft),
    });
  };

  const handleAutoSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setChecked(true);
    (async () => {
      if (userId) {
        await persistAnswers();
        await submitAttempt();
      }
      try {
        if (slug) localStorage.removeItem(LS_KEY(slug));
      } catch {}
      if (test) router.push(`/listening/${test.slug}/review`);
    })();
  };

  // --- Loading skeleton ---
  if (!test) {
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

  const secCount = test.sections.length;
  const currentSection = useMemo(() => test.sections[currentIdx] ?? null, [test, currentIdx]);
  const sliceSecs = currentSection
    ? Math.max(0, Math.round((currentSection.endMs - currentSection.startMs) / 1000))
    : 0;

  return (
    <>
      <FocusGuard exam="listening" slug={slug} />
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-slab text-4xl text-gradient-primary">{test.title}</h1>
              <p className="text-grayish">Auto-play per section • Transcript toggle • Answer highlighting</p>
            </div>
            <div className="flex items-center gap-3">
              <Timer
                initialSeconds={TOTAL_TIME_SEC}
                onTick={(s) => setTimeLeft(Math.ceil(s))}
                onComplete={handleAutoSubmit}
                running={!submittedRef.current}
              />
              <Badge variant={autoPlay ? 'success' : 'warning'}>Auto-play: {autoPlay ? 'On' : 'Off'}</Badge>
              <Button variant="secondary" onClick={() => setAutoPlay((v) => !v)}>
                Toggle Auto-play
              </Button>
            </div>
          </div>

          {/* Not logged-in notice (only when auth is actually known) */}
          {authReady && !userId && (
            <Alert variant="info" className="mt-6" title="Sign in to save progress">
              You can practice without signing in, but answers won’t be saved. (We only store your own rows; RLS enforced.)
            </Alert>
          )}

          {/* Save status */}
          {saveError && (
            <Alert variant="error" className="mt-6" title="Couldn’t save">
              {saveError}
            </Alert>
          )}
          {saving && <Alert variant="info" className="mt-6">Saving…</Alert>}

          {/* Audio + controls */}
          <Card className="p-6 mt-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <audio
                ref={audioRef}
                src={test.masterAudioUrl}
                controls
                className="w-full md:w-auto"
                onPlay={() => setReady(true)}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                >
                  ← Prev
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIdx((i) => Math.min(secCount - 1, i + 1))}
                  disabled={currentIdx === secCount - 1}
                >
                  Next →
                </Button>
                <Button
                  onClick={() => {
                    const a = audioRef.current;
                    if (!a) return;
                    if (a.paused) {
                      a.play().catch(() => {});
                    } else {
                      a.pause();
                    }
                  }}
                >
                  {ready && audioRef.current?.paused ? 'Play' : 'Pause'}
                </Button>
                <Button variant="secondary" onClick={() => setShowTranscript((v) => !v)}>
                  {showTranscript ? 'Hide transcript' : 'Show transcript'}
                </Button>
                {!!userId && (
                  <Button variant="secondary" onClick={persistAnswers} disabled={saving}>
                    Save progress
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 text-small opacity-80">
              Section {currentSection?.orderNo} of {secCount} • {sliceSecs}s slice
            </div>
          </Card>

          {/* Transcript */}
          {showTranscript && currentSection?.transcript && (
            <Card className="p-6 mt-6">
              <h3 className="font-semibold mb-2">Transcript</h3>
              <p className="opacity-90">{currentSection.transcript}</p>
            </Card>
          )}

          {/* Questions */}
          <div className="grid gap-6 mt-8 md:grid-cols-2">
            {currentSection?.questions.map((q) => (
              <Card key={q.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">
                    Q{q.qNo}. {q.prompt}
                  </h3>
                  {checked && (
                    <Badge variant={isCorrect(q) ? 'success' : 'danger'} size="sm">
                      {isCorrect(q) ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                </div>

                {q.type === 'mcq' ? (
                  <ul className="mt-4 grid gap-2">
                    {(q as MCQ).options.map((opt) => {
                      const chosen = answers[q.id] === opt;
                      const correct = (q as MCQ).answer === opt;
                      const showState = checked && (chosen || correct);
                      const cls = showState
                        ? correct
                          ? 'border-success/50 bg-success/10'
                          : chosen
                          ? 'border-sunsetOrange/50 bg-sunsetOrange/10'
                          : 'border-gray-200'
                        : 'border-gray-200 dark:border-white/10';
                      return (
                        <li key={opt}>
                          <button
                            type="button"
                            onClick={() => handleMCQ(q as MCQ, opt)}
                            className={`w-full text-left p-3.5 rounded-ds border ${cls}`}
                          >
                            <span className="mr-2">{opt}</span>
                            {checked && correct && <i className="fas fa-check-circle text-success" aria-hidden />}
                            {checked && !correct && chosen && (
                              <i className="fas fa-times-circle text-sunsetOrange" aria-hidden />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="mt-4">
                    {!checked ? (
                      <Input
                        label=""
                        placeholder="Type your answer"
                        value={answers[q.id] ?? ''}
                        onChange={(e) => handleGap(q as GAP, (e.target as HTMLInputElement).value)}
                      />
                    ) : (
                      <Alert variant={isCorrect(q) ? 'success' : 'error'}>
                        <div className="flex flex-col">
                          <span>
                            <strong>Your answer:</strong> {answers[q.id] || <em>(blank)</em>}
                          </span>
                          {!isCorrect(q) && (
                            <span>
                              <strong>Correct:</strong> {(q as GAP).answer}
                            </span>
                          )}
                        </div>
                      </Alert>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-8">
            {!checked ? (
              <Button
                onClick={async () => {
                  setChecked(true);
                  if (userId) await persistAnswers();
                }}
              >
                Check answers
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setChecked(false)}>
                  Edit answers
                </Button>
                <Button
                  onClick={async () => {
                    if (userId) {
                      await persistAnswers();
                      if (currentIdx >= secCount - 1) {
                        await submitAttempt();
                      }
                    }
                    if (currentIdx >= secCount - 1) {
                      try {
                        if (slug) localStorage.removeItem(LS_KEY(slug));
                      } catch {}
                      router.push(`/listening/${test.slug}/review`);
                    } else {
                      setCurrentIdx((i) => i + 1);
                      setChecked(false);
                    }
                  }}
                >
                  {currentIdx < secCount - 1 ? 'Next section' : 'Finish & Review'}
                </Button>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
