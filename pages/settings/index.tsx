this is my existing, update it nd gimme full revised code

// pages/dashboard/index.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { badges } from '@/data/badges';

import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { ReadingStatsCard } from '@/components/reading/ReadingStatsCard';
import QuickDrillButton from '@/components/quick/QuickDrillButton';
import { WordOfTheDayCard } from '@/components/feature/WordOfTheDayCard';
import { HeaderStreakChip } from '@/components/feature/HeaderStreakChip';

import { useStreak } from '@/hooks/useStreak';
import { getDayKeyInTZ } from '@/lib/streak';
import dynamic from 'next/dynamic';
const StudyCalendar = dynamic(() => import('@/components/feature/StudyCalendar'), { ssr: false });
import GoalRoadmap from '@/components/feature/GoalRoadmap';
import GapToGoal from '@/components/visa/GapToGoal';
import MotivationCoach from '@/components/coach/MotivationCoach';
import type { Profile, AIPlan } from '@/types/profile';
import { SavedItems } from '@/components/dashboard/SavedItems';
import ShareLinkCard from '@/components/dashboard/ShareLinkCard';
import WhatsAppOptIn from '@/components/dashboard/WhatsAppOptIn';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Hook now exposes: nextRestart + shields + claimShield + useShield
  const {
    current: streak,
    lastDayKey,
    loading: streakLoading,
    completeToday,
    nextRestart,
    shields,
    claimShield,
    useShield,
  } = useStreak();

  const handleShare = () => {
    const text = `I'm studying for IELTS on GramorX with a ${streak}-day streak!`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title: 'My IELTS progress', text, url }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Handle OAuth callback on first load
        if (typeof window !== 'undefined') {
          const url = window.location.href;
          if (url.includes('code=') || url.includes('access_token=')) {
            const { error } = await supabaseBrowser.auth.exchangeCodeForSession(url);
            if (!error) {
              await router.replace('/dashboard');
              // continue to load dashboard normally
            }
          }
        }

        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();

        if (!session?.user) {
          await router.replace('/login?next=/dashboard');
          return;
        }

        // Load (or create minimal) profile
        const { data, error } = await supabaseBrowser
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[dashboard] profile load error:', error);
          setLoading(false);
          return;
        }

        let p = data as Profile | null;

        // If the profile row doesn't exist yet, create a minimal one so we don't bounce
        if (!p) {
          const minimal = {
            user_id: session.user.id,
            email: session.user.email,
            preferred_language: 'en',
            onboarding_complete: false,
          } as any;

          const { data: created, error: insertErr } = await supabaseBrowser
            .from('user_profiles')
            .insert(minimal)
            .select('*')
            .single();

          if (insertErr) {
            console.error('[dashboard] profile insert error:', insertErr);
          } else {
            p = created as Profile;
          }
        }

        // Determine if onboarding is incomplete WITHOUT redirecting
        const draftFlag = (p as any)?.draft === true;
        const explicitIncomplete = (p as any)?.onboarding_complete === false;
        // Heuristic fallback (if schema doesn't have flags)
        const heuristicIncomplete =
          (p as any)?.onboarding_complete == null &&
          (!p?.full_name || !p?.preferred_language);

        setNeedsSetup(!!(draftFlag || explicitIncomplete || heuristicIncomplete));

        setProfile(p ?? null);
        setLoading(false);
      } catch (e) {
        console.error('[dashboard] fatal load error:', e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dashboardTipsDismissed');
      if (!dismissed) setShowTips(true);
    }
  }, []);

  const dismissTips = () => {
    setShowTips(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardTipsDismissed', '1');
    }
  };

  useEffect(() => {
    if (streakLoading) return;
    const today = getDayKeyInTZ();
    if (lastDayKey !== today) {
      void completeToday().catch(() => {});
    }
  }, [streakLoading, lastDayKey, completeToday]);

  if (loading) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 rounded-ds-2xl">
                <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="mt-4 animate-pulse h-24 bg-gray-200 dark:bg-white/10 rounded" />
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  const ai: AIPlan = (profile?.ai_recommendation ?? {}) as AIPlan;
  const prefs = profile?.study_prefs ?? [];
  const earnedBadges = [...badges.streaks, ...badges.milestones, ...badges.community];

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        {/* Setup banner instead of redirect */}
        {needsSetup && (
          <Alert variant="warning" className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-medium">Complete your profile to unlock a personalized plan.</div>
                <div className="text-sm opacity-80">It only takes a minute—target band, exam date and study prefs.</div>
              </div>
              <Button as="a" href="/profile/setup" variant="secondary" className="rounded-ds-xl">
                Continue setup
              </Button>
            </div>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-slab text-display text-gradient-primary">
              Welcome, {profile?.full_name || 'Learner'}!
            </h1>
            <p className="text-grayish">Let’s hit your target band with a personalized plan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <HeaderStreakChip />
            <StreakIndicator value={streak} />
            {earnedBadges.map((b) => (
              <Badge key={b.id} size="sm">
                {b.icon}
              </Badge>
            ))}
            <Badge size="sm" variant="secondary">
              {(profile?.preferred_language ?? 'en').toUpperCase()}
            </Badge>
            <Badge size="sm">🛡 {shields}</Badge>
            <Button onClick={claimShield} variant="secondary" className="rounded-ds-xl">
              Claim Shield
            </Button>
            {shields > 0 && (
              <Button onClick={useShield} variant="secondary" className="rounded-ds-xl">
                Use Shield
              </Button>
            )}
            {streak >= 7 && <Badge variant="success" size="sm">🔥 {streak}-day streak!</Badge>}

            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={56}
                height={56}
                className="rounded-full ring-2 ring-primary/40"
              />
            ) : null}
          </div>
        </div>

        {nextRestart && (
          <Alert variant="info" className="mt-6">
            Streak will restart on {nextRestart}.
          </Alert>
        )}

        {showTips && (
          <Alert variant="info" className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <span>Explore practice modules and track your progress from here.</span>
              <Button size="sm" variant="secondary" onClick={dismissTips} className="rounded-ds-xl">
                Got it
              </Button>
            </div>
          </Alert>
        )}

        {/* Word of the day */}
        <div className="mt-10">
          <WordOfTheDayCard />
        </div>

        {/* Top summary cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">Goal Band</div>
            <div className="text-h1 font-semibold">
              {profile?.goal_band?.toFixed?.(1) ?? (ai.suggestedGoal?.toFixed?.(1) || '—')}
            </div>
            <div className="mt-3">
              <Badge variant="info" size="sm">{profile?.english_level || 'Level —'}</Badge>
            </div>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">ETA to Goal</div>
            <div className="text-h1 font-semibold">
              {ai.etaWeeks ?? '—'}
              <span className="text-h3 ml-1">weeks</span>
            </div>
            <div className="mt-3 text-small opacity-80">
              Assuming {profile?.time_commitment || '1–2h/day'}
            </div>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">Focus Sequence</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {(ai.sequence ?? prefs).slice(0, 4).map((s) => (
                <Badge key={s} size="sm">
                  {s}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Next suggested lessons */}
        {(ai.sequence ?? []).length > 0 && (
          <div className="mt-10">
            <h2 className="font-slab text-h2 mb-4">Next Lessons</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {(ai.sequence ?? []).slice(0, 3).map((s) => (
                <Card key={s} className="p-6 rounded-ds-2xl flex flex-col">
                  <h3 className="font-slab text-h3 mb-2 capitalize">{s}</h3>
                  <Button
                    as="a"
                    href={`/learning/skills/${s.toLowerCase()}`}
                    variant="primary"
                    className="mt-auto rounded-ds-xl"
                  >
                    Start
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Visa gap summary */}
        <div className="mt-10">
          <GapToGoal />
        </div>

        {/* Study calendar */}
        <div className="mt-10">
          <StudyCalendar />
        </div>

        {/* Goal roadmap */}
        <div className="mt-10">
          <GoalRoadmap examDate={profile?.exam_date ?? null} />
        </div>

        {/* Actions + Reading stats */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-h2">Quick Actions</h2>
            <p className="text-grayish mt-1">Jump back in with one click.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <QuickDrillButton />
              <Button as="a" href="/learning" variant="primary" className="rounded-ds-xl">
                Start Today’s Lesson
              </Button>
              <Button as="a" href="/mock-tests" variant="secondary" className="rounded-ds-xl">
                Take a Mock Test
              </Button>
              <Button as="a" href="/writing" variant="accent" className="rounded-ds-xl">
                Practice Writing
              </Button>
              <Button as="a" href="/reading" variant="secondary" className="rounded-ds-xl">
                Practice Reading
              </Button>
              <Button onClick={handleShare} variant="secondary" className="rounded-ds-xl">
                Share Progress
              </Button>
            </div>
          </Card>

          <ReadingStatsCard />
        </div>

        {/* Engagement */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ShareLinkCard />
          <WhatsAppOptIn />
        </div>

        {/* Skill analytics */}
        <div className="mt-10">
          <Card className="p-6 rounded-ds-2xl">
            <h3 className="font-slab text-h3 mb-2">Skill Focus</h3>
            {(ai.sequence ?? []).length ? (
              <ul className="list-disc pl-6 text-body">
                {(ai.sequence ?? []).map((s, i, arr) => (
                  <li key={s}>
                    {s} {i === 0 ? '- prioritize' : i === arr.length - 1 ? '- strong' : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body">Add preferences in your profile to see analytics.</p>
            )}
          </Card>
        </div>

        {/* Saved items */}
        <div className="mt-10">
          <SavedItems />
        </div>

        {/* Upgrade */}
        <div className="mt-10">
          <Card className="p-6 rounded-ds-2xl">
            <h3 className="font-slab text-h3 mb-2">Upgrade to Rocket 🚀</h3>
            <p className="text-body opacity-90">
              Unlock AI deep feedback, speaking evaluator, and full analytics.
            </p>
            <div className="mt-4">
              <Button as="a" href="/pricing" variant="primary" className="rounded-ds-xl">
                See Plans
              </Button>
            </div>
          </Card>
        </div>

        {/* Motivation coach */}
        <div className="mt-10">
          <MotivationCoach />
        </div>

        {/* Coach notes */}
        <div className="mt-10">
          <Card className="p-6 rounded-ds-2xl">
            <h3 className="font-slab text-h3">Coach Notes</h3>
            {Array.isArray(ai?.notes) && ai.notes.length ? (
              <ul className="mt-3 list-disc pl-6 text-body">
                {ai.notes.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            ) : (
              <Alert variant="info" className="mt-3">
                Add more details in <b>Profile</b> to refine your AI plan.
              </Alert>
            )}
            <div className="mt-4">
              <Button as="a" href="/profile/setup" variant="secondary" className="rounded-ds-xl">
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
