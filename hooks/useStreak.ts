import { useCallback, useEffect, useState } from 'react';
import { fetchStreak, incrementStreak, scheduleRecovery as apiScheduleRecovery } from '@/lib/streak';

export type StreakState = {
  loading: boolean;
  current: number;
  lastDayKey: string | null;
  nextRestart: string | null;
  error?: string;
};

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    loading: true,
    current: 0,
    lastDayKey: null,
    nextRestart: null,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchStreak();
      setState({
        loading: false,
        current: data.current_streak ?? 0,
        lastDayKey: data.last_activity_date ?? null,
        nextRestart: data.next_restart_date ?? null,
      });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completeToday = useCallback(async () => {
    try {
      const data = await incrementStreak();
      setState(s => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
      }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Failed to update' }));
      throw e;
    }
  }, []);

  const scheduleRecovery = useCallback(async (date: string) => {
    try {
      const data = await apiScheduleRecovery(date);
      setState(s => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
      }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Failed to schedule recovery' }));
      throw e;
    }
  }, []);

  return { ...state, reload: load, completeToday, scheduleRecovery };
}
