/** Mapping of error tags to remedial exercise identifiers */
export const remediationMap: Record<string, string[]> = {
  grammar: ['grammar-basics'],
  vocabulary: ['vocab-drill'],
  pronunciation: ['pronunciation-practice'],
};

/** Count occurrences of each error tag */
export function tagErrors(errors: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const err of errors) {
    counts[err] = (counts[err] ?? 0) + 1;
  }
  return counts;
}

/** Map error tags to remedial exercises */
export function mapToRemedialExercises(errors: string[]): string[] {
  const tags = tagErrors(errors);
  const exercises = new Set<string>();
  for (const tag of Object.keys(tags)) {
    const mapped = remediationMap[tag];
    if (mapped) mapped.forEach((e) => exercises.add(e));
  }
  return Array.from(exercises);
}
