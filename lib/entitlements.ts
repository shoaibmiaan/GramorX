import type { SupabaseClient } from '@supabase/supabase-js';

export type Plan = 'free' | 'premium';

// Map of plan -> enabled feature identifiers.
const FEATURES: Record<Plan, string[]> = {
  free: [],
  premium: ['premium'],
};

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<Plan> {
  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return data ? 'premium' : 'free';
}

export function hasFeature(plan: Plan, feature: string) {
  return FEATURES[plan].includes(feature);
}

export function upgradeMessage(_feature: string) {
  return 'Upgrade to the premium plan to access this feature.';
}
