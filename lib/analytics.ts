export type ReadingAttempt = {
  score: number;
  maxScore: number;
  byType: Record<string, { correct: number; total: number }>;
};

export type ReadingStats = {
  attempts: number;
  totalScore: number;
  totalMax: number;
  byType: Record<string, { correct: number; total: number }>;
};

export async function getReadingStats(): Promise<ReadingStats> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('readingAttempts') : null;
    const arr: ReadingAttempt[] = raw ? JSON.parse(raw) : [];
    const stats: ReadingStats = { attempts: arr.length, totalScore: 0, totalMax: 0, byType: {} };
    arr.forEach((a) => {
      stats.totalScore += a.score;
      stats.totalMax += a.maxScore;
      Object.entries(a.byType || {}).forEach(([k, v]) => {
        stats.byType[k] ||= { correct: 0, total: 0 };
        stats.byType[k].correct += v.correct;
        stats.byType[k].total += v.total;
      });
    });
    return stats;
  } catch {
    return { attempts: 0, totalScore: 0, totalMax: 0, byType: {} };
  }
}
