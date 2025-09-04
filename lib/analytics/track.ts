// lib/analytics/track.ts

/**
 * Safe analytics wrapper for both Node (tests) and Browser.
 * Always resolves to a boolean, never undefined.
 */
export async function track(
  event: string,
  props: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', event, props);
      (window as any).fbq?.('trackCustom', event, props);
    } else {
      // Node/tests: no-op (keeps tests stable)
      // eslint-disable-next-line no-console
      console.log(`[track:${event}]`, props);
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[track] failed', err);
    return false;
  }
}
