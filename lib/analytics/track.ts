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
  initGA();
  initMeta();
  bootstrapped = true;
}

export function track(event: AnalyticsEventName, props: AnalyticsProps = {}, opts: TrackOptions = {}) {
  if (!isBrowser) return; // server no-op
  ensureInit();
  if (!opts.skipGA) ga4Track(event, props);
  if (!opts.skipMeta) metaTrack(event, props);
}
