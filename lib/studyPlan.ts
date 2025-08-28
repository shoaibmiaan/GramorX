export interface AttemptCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  target: number; // number of tasks planned for the day
}

export interface PlanResult {
  next7: DayPlan[];
  dailyTarget: number;
  weeklyTarget: number;
  eta: string | null;
}

/**
 * Calculate slip recovery and future targets based on recent attempt history.
 *
 * @param history Array of attempt counts ordered by date ascending. Should
 *   include at least the last 7 days.
 * @param baseDaily Baseline daily target.
 * @param goalTotal Total number of tasks required to reach the goal.
 * @param totalAttempts Total attempts already completed.
 */
export function analyzePlan(
  history: AttemptCount[],
  baseDaily: number,
  goalTotal: number,
  totalAttempts: number
): PlanResult {
  const last7 = history.slice(-7);
  const completedLast7 = last7.reduce((sum, h) => sum + h.count, 0);
  const missed = last7.reduce((sum, h) => sum + Math.max(0, baseDaily - h.count), 0);

  const next7 = slipRecovery(baseDaily, last7, missed);

  const avgDaily = last7.length > 0 ? completedLast7 / last7.length : 0;
  const remaining = Math.max(0, goalTotal - totalAttempts);
  const etaDays = avgDaily > 0 ? Math.ceil(remaining / avgDaily) : null;
  const eta = etaDays
    ? new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : null;

  return {
    next7,
    dailyTarget: baseDaily,
    weeklyTarget: baseDaily * 7,
    eta,
  };
}

/**
 * Distribute missed tasks over the next seven days.
 * Exposed for other modules needing slip-recovery logic.
 */
export function slipRecovery(
  baseDaily: number,
  last7: AttemptCount[],
  missedOverride?: number
): DayPlan[] {
  const missed =
    typeof missedOverride === 'number'
      ? missedOverride
      : last7.reduce((sum, h) => sum + Math.max(0, baseDaily - h.count), 0);
  const perDayExtra = Math.floor(missed / 7);
  const remainder = missed % 7;

  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const extra = perDayExtra + (i < remainder ? 1 : 0);
    days.push({
      date: d.toISOString().slice(0, 10),
      target: baseDaily + extra,
    });
  }
  return days;
}
