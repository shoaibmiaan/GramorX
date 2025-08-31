import { env, isBrowser } from '@/lib/env';
import type { AnalyticsProps } from '../events';

declare global { interface Window { fbq?: (...a: any[]) => void; } }

export function initMeta() {
  if (!isBrowser || window.fbq || !env.NEXT_PUBLIC_META_PIXEL_ID) return;

  !(function (f: any, b: any, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () { (n.callMethod ? n.callMethod : n.queue).apply(n, arguments as any); };
    if (!f._fbq) f._fbq = n;
    n.push = n; (n as any).loaded = true; (n as any).version = '2.0'; (n as any).queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq?.('init', env.NEXT_PUBLIC_META_PIXEL_ID);
}

export function metaTrack(event: string, props: AnalyticsProps) {
  if (!isBrowser || !window.fbq || !env.NEXT_PUBLIC_META_PIXEL_ID) return;
  window.fbq('trackCustom', event, props);
}
