import React, { useEffect, useRef, useState } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';

/** ─────────────────────────────
 * Minimal in-file Transcript with TTS (no external hooks)
 * Uses the browser Web Speech API; if unavailable, the Play button is disabled.
 * ────────────────────────────*/
type TranscriptProps = { text: string };
const Transcript: React.FC<TranscriptProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const play = () => {
    if (!supported) return;
    // Stop anything currently queued
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1;
    u.pitch = 1;

    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    utteranceRef.current = u;
    setIsSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="rounded-ds-xl border border-border/60 p-4 bg-white/60 dark:bg-dark/40">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-medium">AI Transcript</div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={isSpeaking ? stop : play}
            disabled={!supported}
            className="rounded-ds-xl"
            title={supported ? (isSpeaking ? 'Stop voice' : 'Play voice') : 'Text-to-speech not supported'}
          >
            {supported ? (isSpeaking ? 'Stop' : 'Play') : 'TTS Unavailable'}
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-wrap leading-relaxed text-body text-ink/90">{text}</p>
    </div>
  );
};

/** ─────────────────────────────
 * Types
 * ────────────────────────────*/
type Breakdown = { fluency?: number; lexical?: number; grammar?: number; pronunciation?: number };
type Attempt = {
  id: string;
  scenario: string | null;
  transcript: string | null;
  band_overall: number | null;
  band_breakdown: Breakdown | null;
  audio_urls: Record<string, string[]>;
  created_at: string;
};
type Props = { attempt: Attempt | null };

/** ─────────────────────────────
 * SSR: fetch attempt (requires Supabase envs)
 * ────────────────────────────*/
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const { attemptId } = ctx.query as { attemptId: string };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, anon, {
    global: { headers: { Cookie: ctx.req.headers.cookie || '' } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      redirect: { destination: `/auth/login?next=/speaking/review/${attemptId}`, permanent: false },
    };
  }

  const { data, error } = await supabase
    .from('speaking_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (error || !data) return { props: { attempt: null } };
  return { props: { attempt: data as Attempt } };
};

/** ─────────────────────────────
 * Page
 * ────────────────────────────*/
export default function SpeakingReview({ attempt: initial }: Props) {
  const router = useRouter(); // kept to avoid changing surrounding logic
  const [attempt, setAttempt] = useState<Attempt | null>(initial);
  const [pending, setPending] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function isError(x: unknown): x is Error {
    return typeof x === 'object' && x !== null && 'message' in x;
  }

  async function generateScore() {
    if (!attempt?.id) return;
    setErrMsg(null);
    setPending(true);
    try {
      const r = await fetch('/api/speaking/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attempt.id }),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || 'Scoring failed');
      }
      const data = await r.json() as {
        transcript?: string;
        bandOverall?: number;
        criteria?: Breakdown;
        notes?: string;
      };
      setAttempt(prev => prev ? ({
        ...prev,
        transcript: data.transcript ?? prev.transcript,
        band_overall: typeof data.bandOverall === 'number' ? data.bandOverall : prev.band_overall,
        band_breakdown: data.criteria ?? prev.band_breakdown,
      }) : prev);
    } catch (e: unknown) {
      setErrMsg(isError(e) ? String((e as Error).message) : 'Something went wrong');
    } finally {
      setPending(false);
    }
  }

  if (!attempt) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Card className="p-6">
            <h1 className="font-slab text-4xl">Review</h1>
            <p className="text-grayish mt-2">Attempt not found or you don’t have access.</p>
            <div className="mt-6">
              <Button as="a" href="/speaking" variant="secondary">Back to Speaking</Button>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const b = attempt.band_breakdown || {};
  const groups: Array<[label: string, key: keyof Breakdown]> = [
    ['Fluency', 'fluency'],
    ['Lexical', 'lexical'],
    ['Grammar', 'grammar'],
    ['Pronunciation', 'pronunciation'],
  ];

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left: Summary + Transcript */}
          <Card className="p-6 md:col-span-2 rounded-ds-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-slab text-4xl">Speaking Review</h1>
                {attempt.scenario && (
                  <div className="mt-1 text-small text-grayish">Scenario: {attempt.scenario}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {typeof attempt.band_overall === 'number' ? (
                  <Badge variant="success" className="rounded-ds-xl">
                    Overall Band: <b className="ml-1">{attempt.band_overall.toFixed(1)}</b>
                  </Badge>
                ) : (
                  <Badge variant="warning" className="rounded-ds-xl">Not scored</Badge>
                )}
                <Button
                  variant="primary"
                  onClick={generateScore}
                  disabled={pending}
                  className="rounded-ds-xl"
                  title="Run AI scoring"
                >
                  {pending ? 'Scoring…' : 'Generate Score'}
                </Button>
              </div>
            </div>

            {/* Error inline */}
            {errMsg && (
              <div className="mt-3 p-3.5 rounded-ds border border-sunsetOrange/30 bg-sunsetOrange/10 text-sunsetOrange text-small">
                {errMsg}
              </div>
            )}

            {/* Criteria badges grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {groups.map(([label, key]) => {
                const val = b[key];
                if (val == null) {
                  return (
                    <Badge key={key} variant="neutral" className="rounded-ds-xl justify-center">
                      {label}: —
                    </Badge>
                  );
                }
                return (
                  <Badge key={key} variant="info" className="rounded-ds-xl justify-center">
                    {label}: <b className="ml-1">{val.toFixed(1)}</b>
                  </Badge>
                );
              })}
            </div>

            {/* Transcript w/ TTS */}
            {attempt.transcript && (
              <div className="mt-6">
                <h2 className="text-h3 font-semibold mb-2">Transcript</h2>
                <Transcript text={attempt.transcript} />
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Button as="a" href="/speaking" variant="secondary" className="rounded-ds-xl">
                Back to Speaking
              </Button>
              <Button as="a" href="/speaking/simulator" variant="primary" className="rounded-ds-xl">
                Open Simulator
              </Button>
            </div>
          </Card>

          {/* Right: Recordings */}
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="text-h3 font-semibold">Your Recordings</h2>
            <p className="text-small text-grayish mt-1">
              Audio streams via short-lived signed URLs.
            </p>

            <div className="mt-4 space-y-4">
              {(['p1', 'p2', 'p3', 'chat'] as const).map((k) => {
                const list = (attempt.audio_urls || {})[k] || [];
                if (!list.length) return null;
                return (
                  <div key={k}>
                    <div className="font-medium mb-1 uppercase">{k}</div>
                    <div className="space-y-2">
                      {list.map((path, idx) => (
                        <audio key={path + idx} controls preload="none" className="w-full">
                          {/* Served via /api/speaking/file?path=... which signs the URL server-side */}
                          <source src={`/api/speaking/file?path=${encodeURIComponent(path)}`} />
                        </audio>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
