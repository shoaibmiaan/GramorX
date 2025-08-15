import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { detectBrowserTimeZone } from '@/lib/streak';

export type StreakState = {
  loading: boolean;
  current: number;
  longest: number;
  lastDayKey: string | null;
  error?: string;
  tz: string;
};

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    loading: true,
    current: 0,
    longest: 0,
    lastDayKey: null,
    tz: 'UTC',
  });

  const ensureTz = useCallback(async () => {
    const tz = detectBrowserTimeZone();
    await supabase.rpc('set_streak_timezone', { tz_in: tz });
    return tz;
  }, []);

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: undefined }));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState({ loading: false, current: 0, longest: 0, lastDayKey: null, tz: 'UTC' });
      return;
    }
    const tz = await ensureTz();
    const { data, error } = await supabase.rpc('get_streak'); // from previous setup
    if (error) {
      setState(s => ({ ...s, loading: false, tz, error: error.message }));
      return;
    }
    if (!data) {
      setState({ loading: false, current: 0, longest: 0, lastDayKey: null, tz });
      return;
    }
    setState({
      loading: false,
      current: data.current_streak ?? 0,
      longest: data.longest_streak ?? 0,
      lastDayKey: data.last_day_key ?? null,
      tz,
    });
  }, [ensureTz]);

  useEffect(() => { load(); }, [load]);

  const completeToday = useCallback(async () => {
    const tz = state.tz || detectBrowserTimeZone();
    const { data, error } = await supabase.rpc('complete_daily_action_tz', { tz_in: tz });
    if (error) {
      setState(s => ({ ...s, error: error.message }));
      throw error;
    }
    setState(s => ({
      ...s,
      loading: false,
      current: data?.current_streak ?? s.current,
      longest: data?.longest_streak ?? s.longest,
      lastDayKey: data?.last_day_key ?? s.lastDayKey,
    }));
  }, [state.tz]);

  return { ...state, reload: load, completeToday };
}
