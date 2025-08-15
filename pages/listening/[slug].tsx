import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { Input } from '@/components/design-system/Input';

type MCQ = { id: string; qNo: number; type: 'mcq'; prompt: string; options: string[]; answer: string };
type GAP = { id: string; qNo: number; type: 'gap'; prompt: string; answer: string };
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

export default function ListeningTestPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [userId, setUserId] = useState<string | null>(null);
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [checked, setChecked] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // answers: questionId -> value
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Audio & timing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const gapMsRef = useRef<number>(850); // small 700–1000ms gap

  // Load auth user
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserId(data.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      sub?.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  // Load test from DB
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: t } = await supabase
        .from('lm_listening_tests')
        .select('slug,title,master_audio_url')
        .eq('slug', slug)
        .single();

      if (!t) return;

      const { data: sections } = await supabase
        .from('lm_listening_sections')
        .select('order_no,start_ms,end_ms,transcript')
        .eq('test_slug', slug)
        .order('order_no', { ascending: true });

      const { data: questions } = await supabase
        .from('lm_listening_questions')
        .select('id,q_no,type,prompt,options,answer,section_order')
        .eq('test_slug', slug)
        .order('q_no', { ascending: true });

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
        sec.questions.push(
          q.type === 'mcq'
            ? {
                id: q.id,
                qNo: q.q_no,
                type: 'mcq',
                prompt: q.prompt,
                options: q.options ?? [],
                answer: q.answer,
              }
            : { id: q.id, qNo: q.q_no, type: 'gap', prompt: q.prompt, answer: q.answer }
        );
      });

      const ordered = [...secMap.values()]
        .sort((a, b) => a.orderNo - b.orderNo)
        .map((s) => ({ ...s, questions: [...s.questions].sort((a, b) => a.qNo - b.qNo) }));

      setTest({
        slug: t.slug,
        title: t.title,
        masterAudioUrl: t.master_audio_url,
        sections: ordered,
      });
    })();
  }, [slug]);

  // Rehydrate WIP (answers + section) from localStorage
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

  // Persist WIP to localStorage (debounced-ish)
  useEffect(() => {
    if (!slug) return;
    const id = setTimeout(() => {
      const payload = JSON.stringify({ answers, currentIdx });
      localStorage.setItem(LS_KEY(slug), payload);
    }, 250);
    return () => clearTimeout(id);
  }, [answers, currentIdx, slug]);

  const currentSection = useMemo(() => test?.sections[currentIdx] ?? null, [test, currentIdx]);

  // Audio slice auto-play + small gap between sections
  useEffect(() => {
    if (!test || !currentSection) return;

    const audio = audioRef.current;
    if (!audio) return;
    let advanceTimer: number | null = null;

    const seekToStart = () => {
      audio.currentTime = currentSection.startMs / 1000;
      setReady(true);
      if (autoPlay) {
        audio.play().catch(() => {});
      }
    };

    const onLoaded = () => {
      seekToStart();
    };

    const onTimeUpdate = () => {
      const t = audio.currentTime * 1000;
      if (t >= currentSection.endMs - 25) {
        audio.pause();
        if (autoPlay) {
          // add a tiny gap to avoid clipping
          if (currentIdx < test.sections.length - 1 && advanceTimer == null) {
            advanceTimer = window.setTimeout(() => {
              setCurrentIdx((i) => i + 1);
              advanceTimer = null;
            }, gapMsRef.current);
          }
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
  }, [test, currentSection, autoPlay, currentIdx]);

  const handleMCQ = (q: MCQ, val: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };
  const handleGap = (q: GAP, val: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val.trim() }));
  };
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const isCorrect = (q: Question) => {
    const a = answers[q.id] ?? '';
    return q.type === 'mcq' ? a === (q as MCQ).answer : normalize(a) === normalize((q as GAP).answer);
  };

  // Persist answers to DB (user-scoped rows)
  const persistAnswers = async () => {
    if (!userId || !test) return;
    setSaving(true);
    setSaveError(null);
    try {
      const rows = Object.entries(answers).map(([qid, ans]) => {
        // find q_no by id for stable upsert
        const q = test.sections.flatMap((s) => s.questions).find((q) => q.id === qid)!;
        return { user_id: userId, test_slug: test.slug, q_no: q.qNo, answer: ans };
      });
      if (!rows.length) return;
      const { error } = await supabase
        .from('lm_listening_user_answers')
        .upsert(rows, { onConflict: 'user_id,test_slug,q_no' });
      if (error) throw error;
    } catch (e: any) {
      setSaveError(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-slab text-4xl text-gradient-primary">{test.title}</h1>
            <p className="text-grayish">Auto-play per section • Transcript toggle • Answer highlighting</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={autoPlay ? 'success' : 'warning'}>Auto-play: {autoPlay ? 'On' : 'Off'}</Badge>
            <Button variant="secondary" onClick={() => setAutoPlay((v) => !v)}>
              Toggle Auto-play
            </Button>
          </div>
        </div>

        {/* Not logged-in notice */}
        {!userId && (
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
                /*
                 * When navigating to the previous section we need to clamp the
                 * index to zero to avoid negative indices.  The original
                 * implementation had an extra closing parenthesis after the
                 * `setCurrentIdx` callback which broke the JSX syntax and
                 * prevented the file from compiling.  Remove the stray
                 * parenthesis so that the anonymous callback is closed
                 * properly.
                 */
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                ← Prev
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentIdx((i) => Math.min(test.sections.length - 1, i + 1))}
                disabled={currentIdx === test.sections.length - 1}
              >
                Next →
              </Button>
              <Button
                onClick={() => {
                  const a = audioRef.current;
                  if (!a) return;
                  a.paused ? a.play().catch(() => {}) : a.pause();
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
            Section {currentSection?.orderNo} of {test.sections.length} •{' '}
            {Math.round((currentSection!.endMs - currentSection!.startMs) / 1000)}s slice
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
                          {checked && correct && (
                            <i className="fas fa-check-circle text-success" aria-hidden />
                          )}
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
                  if (userId) await persistAnswers();
                  // If last section -> go to Review page
                  if (currentIdx >= test.sections.length - 1) {
                    // clear draft on finish
                    try {
                      localStorage.removeItem(LS_KEY(slug));
                    } catch {}
                    router.push(`/listening/${test.slug}/review`);
                  } else {
                    setCurrentIdx((i) => i + 1);
                    setChecked(false);
                  }
                }}
              >
                {currentIdx < test.sections.length - 1 ? 'Next section' : 'Finish & Review'}
              </Button>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
