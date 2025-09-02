// lib/usage.ts
import { env } from './env';

export type UsageKey =
  | 'ai.writing.grade'
  | 'ai.speaking.grade'
  | 'ai.explain'
  | 'mock.start'
  | 'mock.submit';

export type IncrementReq = { key: UsageKey; step?: number; dateISO?: string };
export type IncrementRes =
  | { ok: true; key: UsageKey; dateISO: string; count: number }
  | { ok: false; error: string };

export function todayISO(d = new Date()) {
  // YYYY-MM-DD in UTC (server groups by calendar day)
  return d.toISOString().slice(0, 10);
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const { supabaseBrowser } = await import('@/lib/supabaseBrowser');
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

const base =
  typeof window === 'undefined'
    ? env.SITE_URL || env.NEXT_PUBLIC_BASE_URL || ''
    : '';

export async function increment(
  key: UsageKey,
  step = 1,
  dateISO = todayISO(),
): Promise<IncrementRes> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    };
    const r = await fetch(`${base}/api/counters/increment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key, step, dateISO } satisfies IncrementReq),
    });
    const j = (await r.json()) as IncrementRes;
    return j;
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network_error' };
  }
}

/** Quick “can I use this?” guard. */
export async function canUse(
  key: UsageKey,
  limit: number,
): Promise<{ allowed: boolean; count: number; limit: number }> {
  // Step=0 returns current count without increment (API supports it).
  const res = await increment(key, 0);
  const count = res.ok ? res.count : 0;
  return { allowed: count < limit, count, limit };
}
