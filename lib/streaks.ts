import type { SupabaseClient } from '@supabase/supabase-js';

export const dayKey = (date: Date, tz: string): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Sync a user's streak on the server using their timezone.
 * Returns the updated streak count.
 */
export async function syncStreak(
  supabase: SupabaseClient,
  userId: string,
  tz: string,
): Promise<number> {
  const today = dayKey(new Date(), tz);
  const { data, error } = await supabase
    .from('user_streaks')
    .select('current_streak, last_activity_date')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;

  let current = 1;
  if (data?.last_activity_date) {
    if (data.last_activity_date === today) {
      current = data.current_streak;
    } else {
      const yesterday = dayKey(new Date(Date.now() - 86400000), tz);
      if (data.last_activity_date === yesterday) {
        current = data.current_streak + 1;
      }
    }
  }

  const { error: upsertErr } = await supabase
    .from('user_streaks')
    .upsert({ user_id: userId, current_streak: current, last_activity_date: today });
  if (upsertErr) throw upsertErr;
  return current;
}
