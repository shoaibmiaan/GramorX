import { useCallback, useEffect, useState } from 'react';
import {
  fetchStreak,
  incrementStreak,
  claimShield as apiClaimShield,
  scheduleRecovery as apiScheduleRecovery,
  getDayKeyInTZ,
} from '@/lib/streak';

export type StreakState = {
  loading: boolean;
  current: number;
  lastDayKey: string | null;
  nextRestart: string | null;
  shields: number;
  error?: string;
};

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    loading: true,
    current: 0,
    lastDayKey: null,
    nextRestart: null,
    shields: 0,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchStreak();
      setState({
        loading: false,
        current: data.current_streak ?? 0,
        lastDayKey: data.last_activity_date ?? null,
        nextRestart: data.next_restart_date ?? null,
        shields: data.shields ?? 0,
      });
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message || 'Failed to load' }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const completeToday = useCallback(async () => {
    try {
      const today = getDayKeyInTZ();
      const yesterday = getDayKeyInTZ(new Date(Date.now() - 864e5));
      const shouldUseShield =
        state.lastDayKey !== today && state.lastDayKey !== yesterday && state.shields > 0;

      const data = await incrementStreak({ useShield: shouldUseShield });
      setState((s) => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
        shields: data.shields ?? s.shields,
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message || 'Failed to update' }));
      throw e;
    }
  }, [state.lastDayKey, state.shields]);

  const claimShield = useCallback(async () => {
    try {
      const data = await apiClaimShield();
      setState((s) => ({
        ...s,
        shields: data.shields ?? s.shields,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message || 'Failed to claim' }));
      throw e;
    }
  }, []);

  const useShield = useCallback(async () => {
    try {
      const data = await incrementStreak({ useShield: true });
      setState((s) => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
        shields: data.shields ?? s.shields,
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message || 'Failed to use' }));
      throw e;
    }
  }, []);

  const scheduleRecovery = useCallback(async (date: string) => {
    try {
      const data = await apiScheduleRecovery(date);
      setState((s) => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        nextRestart: data.next_restart_date ?? s.nextRestart,
        shields: data.shields ?? s.shields,
      }));
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message || 'Failed to schedule recovery' }));
      throw e;
    }
  }, []);

  return { ...state, reload: load, completeToday, claimShield, useShield, scheduleRecovery };
}
