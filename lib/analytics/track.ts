// lib/analytics/track.ts
import { isBrowser } from '@/lib/env';
import type { AnalyticsEventName, AnalyticsProps } from './events';
import { ga4Track, initGA } from './providers/ga4';
import { metaTrack, initMeta } from './providers/meta';

type TrackOptions = {
  skipMeta?: boolean;
  skipGA?: boolean;
};

let bootstrapped = false;
function ensureInit() {
  if (bootstrapped || !isBrowser) return;
  // Reads IDs from env internally; no-ops if not set
  initGA();
  initMeta();
  bootstrapped = true;
}

/**
 * Track a business event to GA4 + Meta.
 * Safe on SSR (no-ops), safe if no IDs configured.
 */
export function track(
  event: AnalyticsEventName,
  props: AnalyticsProps = {},
  opts: TrackOptions = {},
) {
  if (!isBrowser) return; // server no-op
  ensureInit();

  if (!opts.skipGA) ga4Track(event, props);
  if (!opts.skipMeta) {
    // Map a couple of business events to Meta “standard” ones; rest as custom.
    switch (event) {
      case 'subscribe_clicked':
        metaTrack('InitiateCheckout', props);
        break;
      case 'plan_purchased':
        metaTrack('Purchase', props);
        break;
      case 'signup':
        metaTrack('CompleteRegistration', props);
        break;
      default:
        metaTrack(event, props);
    }
  }
}
