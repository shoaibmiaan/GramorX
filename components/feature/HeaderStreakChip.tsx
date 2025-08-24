import * as React from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function HeaderStreakChip() {
  const [days, setDays] = React.useState<number>(0);

  React.useEffect(() => {
    (async () => {
      const { data: session } = await supabaseBrowser.auth.getSession();
      const token = session?.session?.access_token;
      const res = await fetch('/api/words/today', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setDays(json.streakDays ?? 0);
      }
    })();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
      <span aria-hidden>🔥</span>
      <span className="font-medium">{days}</span>
      <span className="text-muted-foreground">day streak</span>
    </div>
  );
}
