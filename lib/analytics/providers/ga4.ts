import { env, isBrowser } from '@/lib/env';
import type { AnalyticsProps } from '../events';

declare global { interface Window { dataLayer?: any[]; gtag?: (...a: any[]) => void; } }

export function initGA() {
  if (!isBrowser || window.gtag || !env.NEXT_PUBLIC_GA4_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: any[]) => window.dataLayer!.push(args);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA4_ID}`;
  document.head.appendChild(s);

  window.gtag('js', new Date());
  window.gtag('config', env.NEXT_PUBLIC_GA4_ID);
}

export function ga4Track(event: string, props: AnalyticsProps) {
  if (!isBrowser || !window.gtag || !env.NEXT_PUBLIC_GA4_ID) return;
  window.gtag('event', event, props);
}
