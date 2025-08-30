import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export async function logStudyTime(userId: string, minutes: number) {
  await supabase.from('study_time').insert({ user_id: userId, minutes });
}

export async function getTotalStudyTime(userId: string) {
  const { data, error } = await supabase
    .from('study_time')
    .select('minutes')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).reduce((sum: number, row: any) => sum + row.minutes, 0);
}
