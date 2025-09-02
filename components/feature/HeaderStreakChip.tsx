import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function HeaderStreakChip() {
  const [days, setDays] = React.useState<number>(0);

  React.useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const { data: session } = await supabaseBrowser.auth.getSession();
        const token = session?.session?.access_token;

        const res = await fetch('/api/words/today', {
          method: 'GET',
          cache: 'no-store',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ac.signal,
        });

        if (!res.ok) {
          setDays(0);
          return;
        }

        const json: { streakDays?: number } = await res.json();
        setDays(Number.isFinite(json?.streakDays) ? (json.streakDays as number) : 0);
      } catch {
        // Soft-fail: keep UI alive with 0 streak
        setDays(0);
      }
    })();

    return () => ac.abort();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm bg-background/70 backdrop-blur">
      <span aria-hidden>🔥</span>
      <span className="font-medium">{days}</span>
      <span className="text-muted-foreground">day streak</span>
    </div>
  );
}
