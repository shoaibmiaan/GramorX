// lib/analytics/providers/ga4.ts
import { env, isBrowser } from '@/lib/env';
import type { AnalyticsProps } from '../events';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...a: any[]) => void;
  }
}

/** Inject GA4 and configure; safe to call multiple times. */
export function initGA() {
  if (!isBrowser) return;
  const id = env.NEXT_PUBLIC_GA4_ID;
  if (!id) return;

  if (!window.dataLayer) window.dataLayer = [];
  if (!window.gtag) {
    window.gtag = (...args: any[]) => window.dataLayer!.push(args);
  }

  // Avoid double-inject
  const src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  if (!document.querySelector(`script[src="${src}"]`)) {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  // Initialize; disable auto page_view so apps can control it
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: false });
}

/** Track any GA4 event */
export function ga4Track(event: string, props: AnalyticsProps = {}) {
  if (!isBrowser || !window.gtag || !env.NEXT_PUBLIC_GA4_ID) return;
  window.gtag('event', event, props);
}
