// lib/analytics/providers/meta.ts
import { env } from '@/lib/env';

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const isBrowser = typeof window !== 'undefined';

/** Ensure fbq exists; create a queuing stub and inject the script if needed. */
function ensureFbq(): Fbq | null {
  if (!isBrowser) return null;

  if (!window.fbq) {
    const fbq: Fbq = ((...args: unknown[]) => {
      (fbq.queue ||= []).push(args);
    }) as Fbq;

    fbq.queue = [];
    fbq.loaded = false;
    fbq.version = '2.0';
    window.fbq = fbq;

    // Load Meta Pixel exactly once
    if (!document.getElementById('facebook-pixel')) {
      const s = document.createElement('script');
      s.async = true;
      s.id = 'facebook-pixel';
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
    }
  }
  return window.fbq!;
}

/** Initialize pixel using env. Safe to call many times. */
export function initMeta(): void {
  const fbq = ensureFbq();
  if (!fbq) return;

  const id = env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!id) return;

  // Avoid duplicate init
  (window as any).__fb_pixel_inited__ ||= new Set<string>();
  const inited: Set<string> = (window as any).__fb_pixel_inited__;
  if (!inited.has(id)) {
    window.fbq?.('init', id);
    inited.add(id);
  }
}

/** Track Meta standard or custom event (auto-fallback to custom). */
export function metaTrack(event: string, params?: Record<string, unknown>) {
  if (!isBrowser) return;
  const fbq = ensureFbq();
  if (!fbq) return;

  try {
    window.fbq?.('track', event, params);
  } catch {
    window.fbq?.('trackCustom', event, params);
  }
}
