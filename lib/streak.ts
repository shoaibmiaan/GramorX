    // lib/streak.ts

/**
 * Get the browser's IANA time zone (e.g., "Asia/Karachi", "America/New_York").
 * Falls back to "UTC" if not available.
 */
export const detectBrowserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Human-friendly label for a streak number.
 * Example: 0 -> "Start your streak", 7 -> "Day 7"
 */
export const formatStreakLabel = (n: number): string =>
  n > 0 ? `Day ${n}` : 'Start your streak';

/**
 * (Optional compat) Build a YYYY-MM-DD day key for a given Date in a given IANA TZ.
 * Prefer server-side day boundaries; this helper is kept for legacy callers.
 */
export const getDayKeyInTZ = (
  date: Date = new Date(),
  tz: string = detectBrowserTimeZone()
): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/** Data returned by the streak API */
export type StreakData = {
  current_streak: number;
  last_activity_date: string | null;
  next_restart_date?: string | null;
};

/** Fetch current streak for the logged-in user */
const handle = async (res: Response, fallbackMsg: string): Promise<StreakData> => {
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }
  if (!res.ok) {
    throw new Error(json?.error || fallbackMsg);
  }
  return {
    current_streak: json?.current_streak ?? 0,
    last_activity_date: json?.last_activity_date ?? null,
    next_restart_date: json?.next_restart_date ?? null,
  };
};

/** Fetch current streak for the logged-in user */
export async function fetchStreak(): Promise<StreakData> {
  try {
    const res = await fetch('/api/streak');
    return await handle(res, 'Failed to fetch streak');
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/** Mark today's activity and return the updated streak */
export async function incrementStreak(): Promise<StreakData> {
  try {
    const res = await fetch('/api/streak', { method: 'POST' });
    return await handle(res, 'Failed to update streak');
  } catch (e) {
    console.error(e);
    throw e;
  }
}

/** Schedule a streak recovery and return the planned restart */
export async function scheduleRecovery(date: string): Promise<StreakData> {
  try {
    const res = await fetch('/api/streak/recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    return await handle(res, 'Failed to schedule recovery');
  } catch (e) {
    console.error(e);
    throw e;
  }
}
