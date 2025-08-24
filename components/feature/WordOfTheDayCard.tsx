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

  const load = React.useCallback(async () => {
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    const res = await fetch('/api/words/today', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (res.ok) setData(await res.json());
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const mark = async () => {
    if (!data || data.learnedToday) return;
    setBusy(true);
    const { data: session } = await supabaseBrowser.auth.getSession();
    const token = session?.session?.access_token;
    const r = await fetch('/api/words/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ wordId: data.word.id }),
    });
    setBusy(false);
    if (r.ok) await load();
  };

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-sm text-muted-foreground mb-2">📘 Word of the Day</div>
      <div className="text-2xl font-semibold">{data.word.word}</div>
      <p className="mt-2 text-muted-foreground">{data.word.meaning}</p>
      {data.word.example && <p className="mt-1 italic text-muted-foreground">&ldquo;{data.word.example}&rdquo;</p>}

      <div className="mt-4 flex items-center gap-3">
        <Button variant={data.learnedToday ? 'secondary' : 'primary'} onClick={mark} disabled={busy || data.learnedToday}>
          {data.learnedToday ? 'Learned today' : 'Mark as Learned'}
        </Button>
        <div className="text-sm text-muted-foreground">
          🔥 <span className="font-medium">{data.streakDays}</span> days &nbsp;•&nbsp; value ${data.streakValueUSD.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
