export interface Performance {
  /** Current difficulty level */
  level: number;
  /** Number of correct answers */
  correct: number;
  /** Total attempts */
  attempts: number;
}

/**
 * Calibrate difficulty based on learner performance. Accuracy above 85% raises
 * the level, below 60% lowers it.
 */
export function calibrateDifficulty(perf: Performance, min = 1, max = 10): number {
  const accuracy = perf.attempts > 0 ? perf.correct / perf.attempts : 0;
  let level = perf.level;
  if (accuracy > 0.85) level += 1;
  else if (accuracy < 0.6) level -= 1;
  return Math.min(Math.max(level, min), max);
}
