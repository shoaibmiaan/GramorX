import { useCallback, useEffect, useState } from 'react';

export type MoodLog = {
  id: string;
  entry_date: string;
  mood: number;
  energy: number;
  note?: string | null;
};

export type WeeklyReflection = {
  id: string;
  week_start: string;
  reflection: string;
};

export function useMood() {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [reflection, setReflection] = useState<WeeklyReflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch('/api/coach/mood');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setLogs(json.logs || []);
      setReflection(json.reflection || null);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addDaily = useCallback(
    async (mood: number, energy: number, note?: string) => {
      const res = await fetch('/api/coach/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'daily', mood, energy, note })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      await load();
    },
    [load]
  );

  const addWeekly = useCallback(
    async (reflectionText: string) => {
      const res = await fetch('/api/coach/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weekly', reflection: reflectionText })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');
      await load();
    },
    [load]
  );

  return { logs, reflection, loading, error, reload: load, addDaily, addWeekly };
}
