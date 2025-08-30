'use client';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Alert } from '@/components/design-system/Alert';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type WOD = {
  word: { id: string; word: string; meaning: string; example: string | null };
  learnedToday: boolean;
  streakDays: number;
  streakValueUSD: number;
};

type HeroProps = {
  /** Optional callback if a parent wants to mirror the streak into header */
  onStreakChange?: (n: number) => void;
};

export const Hero: React.FC<HeroProps> = ({ onStreakChange }) => {
  const [mounted, setMounted] = useState(false);

  // launch countdown (7 days from now – demo)
  const [target, setTarget] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // word + streak (server-backed)
  const [data, setData] = useState<WOD | null>(null);
  const [busy, setBusy] = useState(false);
  const [auth, setAuth] = useState<'unknown' | 'authed' | 'guest'>('unknown');

  useEffect(() => {
    setMounted(true);
    const t = new Date();
    t.setDate(t.getDate() + 7);
    setTarget(t);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = useMemo(() => {
    if (!target || !now) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const ms = +target - +now;
    const clamp = Math.max(ms, 0);
    const days = Math.floor(clamp / (1000 * 60 * 60 * 24));
    const hours = Math.floor((clamp % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((clamp % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((clamp % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [target, now]);

  // Load WOD + streak. Returns the fetched payload so callers can use the new value.
  const load = useCallback(async (): Promise<WOD | null> => {
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) {
      setAuth('guest');
      setData(null);
      onStreakChange?.(0);
      return null;
    }
    setAuth('authed');
    const res = await fetch('/api/words/today', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json: WOD = await res.json();
      setData(json);
      onStreakChange?.(json.streakDays ?? 0);

      // NEW: broadcast to header & others
      try {
        window.dispatchEvent(new CustomEvent('streak:changed', { detail: { value: json.streakDays ?? 0 } }));
      } catch {
        // ignore
      }

      return json;
    }
    setData(null);
    onStreakChange?.(0);
    return null;
  }, [onStreakChange]);

  useEffect(() => {
    load();
  }, [load]);

  const markLearned = async () => {
    if (!data || data.learnedToday) return;
    setBusy(true);
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) {
      setBusy(false);
      return;
    }
    const r = await fetch('/api/words/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ wordId: data.word.id }),
    });
    setBusy(false);
    if (r.ok) {
      // Re-load to get updated streak, then broadcast.
      const updated = await load();
      if (updated) {
        try {
          window.dispatchEvent(new CustomEvent('streak:changed', { detail: { value: updated.streakDays ?? 0 } }));
        } catch {
          // ignore
        }
      }
    }
  };

  if (!mounted) {
    return (
      <section className="min-h-[60vh] grid place-items-center py-20 sm:py-24 relative">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-slab text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight">
              <span className="text-gradient-primary">
                ACHIEVE YOUR DREAM IELTS SCORE WITH AI-POWERED PREPARATION
              </span>
            </h1>
            <div className="h-32" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-[100vh] flex items-center justify-center py-20 sm:py-24 relative">
      <Container>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="font-slab text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-gradient-primary">
              ACHIEVE YOUR DREAM IELTS SCORE WITH AI-POWERED PREPARATION
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Master all four IELTS skills with personalized feedback, adaptive learning paths, and realistic mock tests.
            Join thousands of successful candidates who’ve achieved Band 7+ with our platform.
          </p>

          {/* Countdown */}
          <Card className="inline-block p-6 rounded-2xl">
            <div className="text-primary font-semibold mb-3">PRE-LAUNCH ACCESS IN</div>
            <div className="flex gap-5 justify-center" aria-live="polite">
              {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, idx) => {
                const values = [diff.days, diff.hours, diff.minutes, diff.seconds] as number[];
                const value = values[idx] || 0;
                return (
                  <div key={label} className="text-center">
                    <div className="font-slab text-4xl md:text-5xl font-bold text-gradient-vertical">
                      {String(value).padStart(2, '0')}
                    </div>
                    <div className="uppercase tracking-wide text-muted-foreground text-sm mt-1">{label}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Word of the Day */}
          <Card className="mt-6 max-w-md p-6 rounded-2xl mx-auto">
            <h3 className="text-primary font-semibold text-xl mb-4">
              <i className="fas fa-book mr-2" />
              Word of the Day
            </h3>

            {auth === 'guest' && (
              <Alert variant="info" className="mb-4">
                Sign in to track your streak and unlock daily rewards.
              </Alert>
            )}

            {data ? (
              <>
                <div className="mb-4">
                  <h4 className="text-3xl mb-1 text-primary">{data.word.word}</h4>
                  <div className="text-base text-muted-foreground mb-3">{data.word.meaning}</div>
                  {data.word.example && (
                    <div className="italic text-muted-foreground border-l-4 pl-4 border-border">
                      “{data.word.example}”
                    </div>
                  )}
                </div>

                <Button variant={data.learnedToday ? 'secondary' : 'accent'} onClick={markLearned} disabled={busy || data.learnedToday}>
                  <i className="fas fa-check-circle mr-2" />
                  {data.learnedToday ? 'Learned today' : 'Mark as Learned'}
                </Button>

                <div className="mt-4 rounded-xl p-4 bg-card border border-border text-left">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl" aria-hidden>
                      <i className="fas fa-fire" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Your Learning Streak</h4>
                      <div className="text-muted-foreground">
                        Current streak:{' '}
                        <span className="font-bold">
                          {data.streakDays} {data.streakDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Value at launch:{' '}
                        <span className="font-bold">${(data.streakValueUSD ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert variant="info" className="mt-4">
                  Maintain your streak! Each day you learn a new word, your streak increases. At launch, your streak converts
                  into credits on your subscription.
                </Alert>
              </>
            ) : auth === 'authed' ? (
              <Alert variant="warning">No active words yet. Add words in the admin to start your daily streak.</Alert>
            ) : null}
          </Card>

          <div className="flex gap-4 mt-8 justify-center">
            <Button href="/waitlist" variant="primary">
              Join Exclusive Waitlist
            </Button>
            <Button href="/learning" variant="secondary">
              Explore Features
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
