import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { StreakIndicator } from '@/components/design-system/StreakIndicator';
import { SavedItems } from '@/components/dashboard/SavedItems';
import { useStreak } from '@/hooks/useStreak';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Profile {
  full_name: string;
  country: string | null;
  english_level: string | null;
  goal_band: number | null;
  study_prefs: string[] | null;
  time_commitment: string | null;
  exam_date: string | null;
  preferred_language: string | null;
  draft?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { current: streak } = useStreak();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error || !data || data.draft) {
        router.replace('/profile/setup');
        return;
      }

      setProfile(data as Profile);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <Card className="p-6 rounded-ds-2xl max-w-xl mx-auto">Loading…</Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-xl mx-auto space-y-6">
          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-slab text-display">Profile</h1>
              <StreakIndicator value={streak} />
            </div>
            <div className="space-y-2 text-body">
              <p><strong>Name:</strong> {profile?.full_name}</p>
              <p><strong>Country:</strong> {profile?.country ?? '—'}</p>
              <p><strong>English level:</strong> {profile?.english_level ?? '—'}</p>
              <p>
                <strong>Goal band:</strong>{' '}
                {profile?.goal_band ? profile.goal_band.toFixed(1) : '—'}
              </p>
              <p>
                <strong>Study preferences:</strong>{' '}
                {profile?.study_prefs?.join(', ') || '—'}
              </p>
              <p>
                <strong>Time commitment:</strong> {profile?.time_commitment ?? '—'}
              </p>
              <p>
                <strong>Preferred language:</strong>{' '}
                {profile?.preferred_language ?? '—'}
              </p>
              {profile?.exam_date && (
                <p>
                  <strong>Exam date:</strong> {profile.exam_date}
                </p>
              )}
            </div>
            <Button href="/profile/setup" variant="secondary" className="mt-6">
              Edit profile
            </Button>
          </Card>

          <SavedItems />
        </div>
      </Container>
    </section>
  );
}

