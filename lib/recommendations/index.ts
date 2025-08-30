export interface HistoryItem {
  /** Unique identifier of the task */
  taskId: string;
  /** Score between 0 and 1 representing performance */
  score: number;
  /** When the task was last attempted */
  timestamp: Date;
}

/**
 * Recommend the next tasks for a learner. Tasks with lower scores are
 * prioritised. Tasks that have not been attempted are appended afterwards.
 */
export function recommendTasks(
  history: HistoryItem[],
  catalog: string[],
  limit = 5
): string[] {
  // Map of task -> best score (lower means needs more practice)
  const scores = new Map<string, number>();
  for (const item of history) {
    const prev = scores.get(item.taskId);
    if (prev === undefined || item.score < prev) {
      scores.set(item.taskId, item.score);
    }
  }

  const attempted = new Set(scores.keys());
  const unseen = catalog.filter((id) => !attempted.has(id));

  const sorted = [...scores.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id);

  return [...sorted, ...unseen].slice(0, limit);
}
