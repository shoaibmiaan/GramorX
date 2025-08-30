import { supabaseService } from './supabaseService';

/**
 * Fetch the current credit balance for a user. Falls back to 0 if the
 * profile row is missing or malformed.
 */
export async function getCredits(userId: string): Promise<number> {
  const { data } = await supabaseService
    .from('user_profiles')
    .select('credits')
    .eq('user_id', userId)
    .maybeSingle();
  const c = (data as any)?.credits;
  return typeof c === 'number' && Number.isFinite(c) ? c : 0;
}

/**
 * Consume a number of credits atomically. Returns `true` if the user had
 * enough balance and the deduction succeeded; otherwise returns `false`.
 */
export async function consumeCredits(
  userId: string,
  amount: number,
): Promise<boolean> {
  const current = await getCredits(userId);
  if (current < amount) return false;
  const { error } = await supabaseService
    .from('user_profiles')
    .update({ credits: current - amount })
    .eq('user_id', userId);
  return !error;
}

/**
 * Ensure the user has enough credits and deduct them. Throws an error if the
 * balance is insufficient.
 */
export async function requireCredits(userId: string, amount: number) {
  const ok = await consumeCredits(userId, amount);
  if (!ok) {
    const err: any = new Error('Insufficient credits');
    err.code = 'NO_CREDITS';
    throw err;
  }
}
