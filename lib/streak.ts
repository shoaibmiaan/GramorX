/**
 * Timezone + display helpers
 */
export const detectBrowserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const formatStreakLabel = (n: number): string => (n > 0 ? `Day ${n}` : 'Start your streak');

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

/**
 * API types
 */
export type StreakData = {
  current_streak: number;
  last_activity_date: string | null;
  shields: number;
  next_restart_date: string | null;
};

const normalize = (json: Partial<StreakData> | null | undefined): StreakData => ({
  current_streak: json?.current_streak ?? 0,
  last_activity_date: json?.last_activity_date ?? null,
  shields: json?.shields ?? 0,
  next_restart_date: json?.next_restart_date ?? null,
});

const handle = async (res: Response, fallbackMsg: string): Promise<StreakData> => {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }
  if (!res.ok) {
    const msg = (json as { error?: string })?.error;
    throw new Error(msg || fallbackMsg);
  }
  return normalize(json as Partial<StreakData> | null | undefined);
};

/**
 * API calls
 */
export async function fetchStreak(): Promise<StreakData> {
  const res = await fetch('/api/streak');
  return handle(res, 'Failed to fetch streak');
}

export async function incrementStreak(options: { useShield?: boolean } = {}): Promise<StreakData> {
  const body = options.useShield ? { action: 'use' } : undefined;
  const res = await fetch('/api/streak', {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res, 'Failed to update streak');
}

export async function claimShield(): Promise<StreakData> {
  const res = await fetch('/api/streak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'claim' }),
  });
  return handle(res, 'Failed to claim shield');
}

export async function scheduleRecovery(date: string): Promise<StreakData> {
  const res = await fetch('/api/streak/recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  return handle(res, 'Failed to schedule recovery');
}
