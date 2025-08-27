const intervals = [1, 3, 7, 14, 30];

/**
 * Returns the next review date given the number of completed repetitions.
 * The interval grows over time following a simple spaced repetition sequence.
 */
export function scheduleReview(repetitions: number): Date {
  const idx = Math.min(repetitions, intervals.length - 1);
  const days = intervals[idx];
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next;
}
