import type { Profile, AIPlan } from '@/types/profile';
import { PREFS } from '@/lib/profile-options';

/**
 * Generate an AI plan for a learner. Weaknesses are prioritized
 * at the start of the returned sequence. If no preferences are
 * provided the full PREFS list is used.
 */
export function generateAIPlan(profile: Profile): AIPlan {
  const base = profile.study_prefs?.length ? [...profile.study_prefs] : [...PREFS];
  const weaknesses = profile.weaknesses ?? [];

  // Move weaknesses to the front while preserving their relative order
  const prioritized = [...base];
  weaknesses.forEach((w) => {
    const idx = prioritized.indexOf(w);
    if (idx > 0) {
      prioritized.splice(idx, 1);
      prioritized.unshift(w);
    }
  });

  return {
    sequence: prioritized,
    notes: [`Focus order: ${prioritized.join(' → ')}`],
  };
}

