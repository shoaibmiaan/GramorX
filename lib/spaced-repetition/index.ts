export interface Drill {
  /** Unique identifier for the drill */
  id: string;
  /** Current interval in days */
  interval: number;
  /** Number of successful repetitions */
  repetition: number;
  /** Ease factor controlling growth of interval */
  ease: number;
  /** Date when the drill is due */
  due: Date;
}

/**
 * Schedule the next review for a drill using a simplified SM-2 algorithm.
 * @param drill Current drill state
 * @param grade Quality of the answer from 0 (complete blackout) to 5 (perfect)
 */
export function scheduleDrill(drill: Drill, grade: number): Drill {
  const ease = Math.max(1.3, drill.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  const repetition = grade < 3 ? 0 : drill.repetition + 1;

  let interval: number;
  if (repetition <= 1) interval = 1;
  else if (repetition === 2) interval = 6;
  else interval = Math.round(drill.interval * ease);

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return { id: drill.id, interval, repetition, ease, due };
}

/**
 * Whether the drill is due for review at the given date.
 */
export function isDue(drill: Drill, date: Date = new Date()): boolean {
  return drill.due.getTime() <= date.getTime();
}
