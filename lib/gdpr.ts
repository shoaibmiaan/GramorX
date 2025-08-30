import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** Number of days to retain auxiliary logs before purging */
export const DATA_RETENTION_DAYS = 365;

/**
 * Remove all user-related data across tables.
 * Extend this list as new tables containing personal data are added.
 */
export async function purgeUserData(userId: string) {
  await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId);
  await supabaseAdmin.from('user_bookmarks').delete().eq('user_id', userId);
  await supabaseAdmin.from('focus_violations').delete().eq('user_id', userId);
  await supabaseAdmin.from('exam_results').delete().eq('user_id', userId);
}

/**
 * Purge old records based on DATA_RETENTION_DAYS policy.
 */
export async function purgeExpiredData() {
  const cutoff = new Date(Date.now() - DATA_RETENTION_DAYS * 86400000).toISOString();
  await supabaseAdmin.from('focus_violations').delete().lt('created_at', cutoff);
  await supabaseAdmin.from('login_events').delete().lt('created_at', cutoff);
}
