import * as React from 'react';
import { Button } from '@/components/design-system/Button';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type WOD = {
  word: { id: string; word: string; meaning: string; example: string | null };
  learnedToday: boolean;
  streakDays: number;
  streakValueUSD: number;
};

export function WordOfTheDayCard() {
  const [data, setData] = React.useState<WOD | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const { data: session } = await supabaseBrowser.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch('/api/words/today', {
        method: 'GET',
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError('Could not load Word of the Day.');
        setData(null);
        return;
      }

      const json = (await res.json()) as WOD;
      setData(json);
    } catch {
      setError('Network error. Please retry.');
      setData(null);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const mark = async () => {
    if (!data || data.learnedToday) return;
    setBusy(true);
    setError(null);
    try {
      const { data: session } = await supabaseBrowser.auth.getSession();
      const token = session?.session?.access_token;

      const r = await fetch('/api/words/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ wordId: data.word.id }),
      });

      if (!r.ok) throw new Error('mark-failed');
      await load();
    } catch {
      setError('Could not update. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    // Lightweight placeholder (keeps layout stable)
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="h-4 w-40 rounded bg-muted/30" />
        <div className="mt-3 h-7 w-56 rounded bg-muted/30" />
        <div className="mt-2 h-4 w-full rounded bg-muted/20" />
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-sm text-muted-foreground mb-2">📘 Word of the Day</div>
      <div className="text-2xl font-semibold">{data.word.word}</div>
      <p className="mt-2 text-muted-foreground">{data.word.meaning}</p>
      {data.word.example && (
        <p className="mt-1 italic text-muted-foreground">&ldquo;{data.word.example}&rdquo;</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant={data.learnedToday ? 'secondary' : 'primary'}
          onClick={mark}
          disabled={busy || data.learnedToday}
        >
          {data.learnedToday ? 'Learned today' : busy ? 'Saving…' : 'Mark as Learned'}
        </Button>
        <div className="text-sm text-muted-foreground">
          🔥 <span className="font-medium">{data.streakDays}</span> days &nbsp;•&nbsp; value $
          {Number.isFinite(data.streakValueUSD) ? data.streakValueUSD.toFixed(2) : '0.00'}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
