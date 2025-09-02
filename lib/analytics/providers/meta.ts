// lib/analytics/providers/meta.ts

import { env, isBrowser } from '@/lib/env';

/* Tiny typed wrapper for Meta Pixel (fbq) with SSR safety and no 'arguments' */

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
  }
}

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

    // Load Meta Pixel
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
  }
  return window.fbq!;
}

/** Initialize pixel once you have an ID. Safe to call multiple times. */
export function initMetaPixel(pixelId: string): void {
  const fbq = ensureFbq();
  if (!fbq) return;
  window.fbq?.('init', pixelId);
}

/** Initialize Meta Pixel from environment variable if present */
export function initMeta(): void {
  if (!env.NEXT_PUBLIC_META_PIXEL_ID) return;
  initMetaPixel(env.NEXT_PUBLIC_META_PIXEL_ID);
}

/** Track a standard Meta event */
export function metaTrack(event: string, params?: Record<string, unknown>): void {
  if (!isBrowser) return;
  window.fbq?.('track', event, params);
}

/** Track a custom Meta event */
export function metaTrackCustom(event: string, params?: Record<string, unknown>): void {
  if (!isBrowser) return;
  window.fbq?.('trackCustom', event, params);
}
