import React from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';

type Stat = {
  user_id: string;
  attempts: number;
  total_score: number;
  total_max: number;
  accuracy_pct: number | null;
  avg_duration_ms: number | null;
  first_attempt_at: string | null;
  last_attempt_at: string | null;
};

type Attempt = {
  id: string;
  passage_slug: string;
  score: number;
  max_score: number;
  created_at: string;
};

export function ReadingStatsCard() {
  const [loading, setLoading] = React.useState(true);
  const [stat, setStat] = React.useState<Stat | null>(null);
  const [recent, setRecent] = React.useState<Attempt[]>([]);
  const [isAuthed, setIsAuthed] = React.useState<boolean>(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      const uid = session?.user?.id;
      setIsAuthed(!!uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const [statRes, attemptsRes] = await Promise.all([
        supabaseBrowser
          .from('reading_user_stats')
          .select('*')
          .eq('user_id', uid)
          .single(),
        supabaseBrowser
          .from('reading_attempts')
          .select('id, passage_slug, score, max_score, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (!active) return;
      if (!statRes.error && statRes.data) setStat(statRes.data as Stat);
      if (!attemptsRes.error && attemptsRes.data) setRecent(attemptsRes.data as Attempt[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse h-5 w-40 bg-lightBorder dark:bg-white/10 rounded mb-3" />
        <div className="animate-pulse h-4 w-64 bg-lightBorder dark:bg-white/10 rounded" />
      </Card>
    );
  }

  if (!isAuthed) {
    return (
      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="font-semibold mb-1">Reading progress</div>
          <div className="text-sm text-mutedText dark:text-grayish">Sign in to track your attempts and accuracy.</div>
        </div>
        <Button href="/login" variant="primary" className="rounded-ds-xl">Sign in</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Reading progress</div>
        {stat?.accuracy_pct != null && (
          <Badge>{stat.accuracy_pct}% accuracy</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-sm text-mutedText dark:text-grayish">Attempts</div>
          <div className="text-xl font-semibold">{stat?.attempts ?? 0}</div>
        </div>
        <div>
          <div className="text-sm text-mutedText dark:text-grayish">Points</div>
          <div className="text-xl font-semibold">{stat?.total_score ?? 0}/{stat?.total_max ?? 0}</div>
        </div>
        <div>
          <div className="text-sm text-mutedText dark:text-grayish">Avg. duration</div>
          <div className="text-xl font-semibold">
            {stat?.avg_duration_ms ? Math.round((stat.avg_duration_ms/1000)/60) + ' min' : '—'}
          </div>
        </div>
        <div>
          <div className="text-sm text-mutedText dark:text-grayish">Last attempt</div>
          <div className="text-xl font-semibold">
            {stat?.last_attempt_at ? new Date(stat.last_attempt_at).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      <div className="mb-3 font-medium">Recent attempts</div>
      {recent.length === 0 ? (
        <div className="text-sm text-mutedText dark:text-grayish">No attempts yet. Try a passage to see your stats.</div>
      ) : (
        <ul className="grid gap-2">
          {recent.map(a => (
            <li key={a.id} className="flex items-center justify-between">
              <div className="truncate">
                <Link href={`/reading/review/${a.id}`} className="underline">
                  {a.passage_slug}
                </Link>
                <span className="ml-2 text-sm text-mutedText dark:text-grayish">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
              <Badge>{a.score}/{a.max_score}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2">
        <Button as="a" href="/reading" variant="secondary" className="rounded-ds-xl">Browse passages</Button>
        <Button as="a" href="/reading/passage/reading-test-38" variant="primary" className="rounded-ds-xl">Start now</Button>
      </div>
    </Card>
  );
}
