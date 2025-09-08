'use client';
import { Icon } from "@/components/design-system/Icon";
// components/sections/Hero.tsx
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
  onStreakChange?: (n: number) => void;
};

export const Hero: React.FC<HeroProps> = ({ onStreakChange }) => {
  const [mounted, setMounted] = useState(false);

  // countdown for a soft launch window (7 days)
  const [target, setTarget] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // word + streak
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
    const ms = Math.max(+target - +now, 0);
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }, [target, now]);

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
    const res = await fetch('/api/words/today', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      setData(null);
      onStreakChange?.(0);
      return null;
    }
    const json: WOD = await res.json();
    setData(json);
    onStreakChange?.(json.streakDays ?? 0);
    try {
      window.dispatchEvent(new CustomEvent('streak:changed', { detail: { value: json.streakDays ?? 0 } }));
    } catch {}
    return json;
  }, [onStreakChange]);

  useEffect(() => { void load(); }, [load]);

  const markLearned = async () => {
    if (!data || data.learnedToday) return;
    setBusy(true);
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    if (!token) { setBusy(false); return; }
    const r = await fetch('/api/words/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ wordId: data.word.id }),
    });
    setBusy(false);
    if (r.ok) {
      const updated = await load();
      if (updated) {
        try {
          window.dispatchEvent(new CustomEvent('streak:changed', { detail: { value: updated.streakDays ?? 0 } }));
        } catch {}
      }
    }
  };

  return (
    <section className="min-h-[100vh] flex items-center justify-center py-20 sm:py-24 relative">
      <Container>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="font-slab text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-gradient-primary">ACHIEVE YOUR DREAM IELTS SCORE WITH AI-POWERED PREP</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Master all four modules with adaptive paths, realistic mocks, and instant AI feedback.
          </p>

          {/* Countdown */}
          <Card className="inline-block p-6 rounded-2xl">
            <div className="text-primary font-semibold mb-3">PRE-LAUNCH ACCESS IN</div>
            <div className="flex gap-5 justify-center" aria-live="polite">
              {(['Days','Hours','Minutes','Seconds'] as const).map((label, i) => {
                const v = [diff.days, diff.hours, diff.minutes, diff.seconds][i] || 0;
                return (
                  <div key={label} className="text-center">
                    <div className="font-slab text-4xl md:text-5xl font-bold text-gradient-vertical">
                      {String(v).padStart(2, '0')}
                    </div>
                    <div className="uppercase tracking-wide text-muted-foreground text-sm mt-1">{label}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Word of the Day + streak */}
          <Card className="mt-6 max-w-md p-6 rounded-2xl mx-auto">
            <h3 className="text-primary font-semibold text-xl mb-4">
              <Icon name="book" /> Word of the Day
            </h3>

            {auth === 'guest' && (
              <Alert variant="info" className="mb-4">Sign in to track your streak and unlock daily rewards.</Alert>
            )}

            {data ? (
              <>
                <div className="mb-4">
                  <h4 className="text-3xl mb-1 text-primary">{data.word.word}</h4>
                  <div className="text-base text-muted-foreground mb-3">{data.word.meaning}</div>
                  {data.word.example && (
                    <div className="italic text-muted-foreground border-l-4 pl-4 border-border">“{data.word.example}”</div>
                  )}
                </div>

                <Button variant={data.learnedToday ? 'secondary' : 'accent'} onClick={markLearned} disabled={busy || data.learnedToday}>
                  <Icon name="check-circle" />
                  {data.learnedToday ? 'Learned today' : 'Mark as Learned'}
                </Button>

                <div className="mt-4 rounded-xl p-4 bg-card border border-border text-left">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl" aria-hidden="true"><Icon name="fire" /></div>
                    <div>
                      <h4 className="font-semibold">Your Learning Streak</h4>
                      <div className="text-muted-foreground">Current streak: <span className="font-bold">{data.streakDays} {data.streakDays === 1 ? 'day' : 'days'}</span></div>
                      <div className="text-muted-foreground">Value at launch: <span className="font-bold">${(data.streakValueUSD ?? 0).toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>

                <Alert variant="info" className="mt-4">
                  Maintain your streak! Your days convert into credits at launch.
                </Alert>
              </>
            ) : null}
          </Card>

          <div className="flex gap-4 mt-8 justify-center">
            <Button href="/waitlist" variant="primary">Join Exclusive Waitlist</Button>
            <Button href="/pricing" variant="secondary">See Plans</Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
