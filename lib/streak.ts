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
