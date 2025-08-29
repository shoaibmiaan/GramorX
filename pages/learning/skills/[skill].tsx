import { env } from "@/lib/env";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import type { Profile, AIPlan } from '@/types/profile';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState(0); // wire to real data later
  const [progressSaved, setProgressSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace('/login'); return; }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) console.error(error);
      if (!data || data.draft) {
        router.replace('/profile/setup');
        return;
      }

      setProfile(data as Profile);
      // naive local streak example (replace with real streak table)
      const today = new Date().toDateString();
      const last = typeof window !== 'undefined' ? localStorage.getItem('lastStudy') : null;
      if (last === today) setStreak(prev => Math.max(prev, 1));
      setLoading(false);
    })();
  }, [router]);

  const ai: AIPlan = profile?.ai_recommendation ?? {};
  const prefs = profile?.study_prefs ?? [];
  const notes = Array.isArray(ai.notes) ? ai.notes : [];

  // After a session, rotate the studied skill to the end of study_prefs
  useEffect(() => {
    if (!profile || progressSaved) return;
    const skill = typeof router.query.skill === 'string' ? router.query.skill : null;
    if (!skill) return;

    const current = (ai.sequence ?? prefs).slice();
    if (!current.length) return;

    const idx = current.indexOf(skill);
    if (idx > -1) {
      current.splice(idx, 1);
    }
    current.push(skill);

    void supabase
      .from('user_profiles')
      .update({ study_prefs: current })
      .eq('user_id', profile.user_id as string)
      .then(() => {
        setProfile({ ...profile, study_prefs: current });
        setProgressSaved(true);
      });
  }, [profile, router.query.skill, progressSaved, ai.sequence, prefs]);

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

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-slab text-display text-gradient-primary">Welcome, {profile?.full_name || 'Learner'}!</h1>
            <p className="text-grayish">Let’s hit your target band with a personalized plan.</p>
          </div>
          <div className="flex items-center gap-4">
            <StreakIndicator count={streak} />
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" width={56} height={56} className="rounded-full ring-2 ring-primary/40" />
            ) : null}
          </div>
        </div>

        {/* Top summary cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">Goal Band</div>
            <div className="text-h1 font-semibold">{profile?.goal_band?.toFixed(1) ?? (ai.suggestedGoal?.toFixed?.(1) || '—')}</div>
            <div className="mt-3">
              <Badge variant="info" size="sm">{profile?.english_level || 'Level —'}</Badge>
            </div>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">ETA to Goal</div>
            <div className="text-h1 font-semibold">{ai.etaWeeks ?? '—'}<span className="text-h3 ml-1">weeks</span></div>
            <div className="mt-3 text-small opacity-80">Assuming {profile?.time_commitment || '1–2h/day'}</div>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="text-small opacity-70 mb-1">Focus Sequence</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {(ai.sequence ?? prefs).slice(0,4).map(s => <Badge key={s} size="sm">{s}</Badge>)}
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-h2">Quick Actions</h2>
            <p className="text-grayish mt-1">Jump back in with one click.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as="a" href="/learning" variant="primary" className="rounded-ds-xl">Start Today’s Lesson</Button>
              <Button as="a" href="/mock-tests" variant="secondary" className="rounded-ds-xl">Take a Mock Test</Button>
              <Button as="a" href="/writing" variant="accent" className="rounded-ds-xl">Practice Writing</Button>
            </div>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <h3 className="font-slab text-h3 mb-2">Upgrade to Rocket 🚀</h3>
            <p className="text-body opacity-90">Unlock AI deep feedback, speaking evaluator, and full analytics.</p>
            <div className="mt-4">
              <Button as="a" href="/pricing" variant="primary" className="rounded-ds-xl">See Plans</Button>
            </div>
          </Card>
        </div>

        {/* Plan coach notes */}
        <div className="mt-10">
          <Card className="p-6 rounded-ds-2xl">
            <h3 className="font-slab text-h3">Coach Notes</h3>
            {notes.length ? (
              <ul className="mt-3 list-disc pl-6 text-body">
                {notes.map((n: string, i: number) => <li key={i}>{n}</li>)}
              </ul>
            ) : (
              <Alert variant="info" className="mt-3">Add more details in <b>Profile</b> to refine your AI plan.</Alert>
            )}
            <div className="mt-4">
              <Button as="a" href="/profile/setup" variant="secondary" className="rounded-ds-xl">Edit Profile</Button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
