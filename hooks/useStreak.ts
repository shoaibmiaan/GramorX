import { useCallback, useEffect, useState } from 'react';
import { fetchStreak, incrementStreak, claimShield, getDayKeyInTZ } from '@/lib/streak';

export type StreakState = {
  loading: boolean;
  current: number;
  lastDayKey: string | null;
  shields: number;
  error?: string;
};

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    loading: true,
    current: 0,
    lastDayKey: null,
    shields: 0,
  });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchStreak();
      setState({
        loading: false,
        current: data.current_streak ?? 0,
        lastDayKey: data.last_activity_date ?? null,
        shields: data.shields ?? 0,
      });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Failed to load' }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completeToday = useCallback(async () => {
    try {
      const today = getDayKeyInTZ();
      const yesterday = getDayKeyInTZ(new Date(Date.now() - 864e5));
      const useShield = state.lastDayKey !== today && state.lastDayKey !== yesterday && state.shields > 0;
      const data = await incrementStreak({ useShield });
      setState(s => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        shields: data.shields ?? s.shields,
      }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Failed to update' }));
      throw e;
    }
  }, [state.lastDayKey, state.shields]);

  const claim = useCallback(async () => {
    try {
      const data = await claimShield();
      setState(s => ({ ...s, shields: data.shields ?? s.shields }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Failed to claim' }));
      throw e;
    }
  }, []);

  const useShieldFn = useCallback(async () => {
    try {
      const data = await incrementStreak({ useShield: true });
      setState(s => ({
        ...s,
        current: data.current_streak ?? s.current,
        lastDayKey: data.last_activity_date ?? s.lastDayKey,
        shields: data.shields ?? s.shields,
      }));
    } catch (e: any) {
      setState(s => ({ ...s, error: e.message || 'Failed to use' }));
      throw e;
    }
  }, []);

  return { ...state, reload: load, completeToday, claimShield: claim, useShield: useShieldFn };
}
