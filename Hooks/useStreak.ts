import { useEffect, useState } from 'react';

type StreakData = { count: number; lastDate: string };

const KEY = 'study_streak';

function isYesterday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);
  const diffDays = Math.floor((today.setHours(0,0,0,0) as unknown as number - d.setHours(0,0,0,0) as unknown as number) / 86400000);
  return diffDays === 1;
}

function isToday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr);
  return today.toDateString() === d.toDateString();
}

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    const parsed: StreakData | null = raw ? JSON.parse(raw) : null;
    const todayISO = new Date().toISOString();

    if (!parsed) {
      const init = { count: 1, lastDate: todayISO };
      localStorage.setItem(KEY, JSON.stringify(init));
      setStreak(1);
      return;
    }

    if (isToday(parsed.lastDate)) {
      setStreak(parsed.count);
      return;
    }

    if (isYesterday(parsed.lastDate)) {
      const next = { count: parsed.count + 1, lastDate: todayISO };
      localStorage.setItem(KEY, JSON.stringify(next));
      setStreak(next.count);
      return;
    }

    // Missed a day: reset
    const reset = { count: 1, lastDate: todayISO };
    localStorage.setItem(KEY, JSON.stringify(reset));
    setStreak(1);
  }, []);

  // Optional: Call this when user completes an activity today
  const bumpToday = () => {
    const raw = localStorage.getItem(KEY);
    const parsed: StreakData | null = raw ? JSON.parse(raw) : null;
    const todayISO = new Date().toISOString();

    if (!parsed || !isToday(parsed.lastDate)) {
      const next = { count: (parsed?.count ?? 0) + 1, lastDate: todayISO };
      localStorage.setItem(KEY, JSON.stringify(next));
      setStreak(next.count);
    }
  };

  return { streak, bumpToday };
}
