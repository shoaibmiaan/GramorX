import { env, isBrowser } from '@/lib/env';

declare global {
  interface Window {
    __sentry_inited?: boolean;
  }
}

type SentryModule = typeof import('@sentry/nextjs');

export function initSentry() {
  if (!isBrowser || !env.NEXT_PUBLIC_SENTRY_DSN) return;
  if (window.__sentry_inited) return;
  try {
    import('@sentry/nextjs').then((Sentry: SentryModule) => {
      Sentry.init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN! });
      window.__sentry_inited = true;
    });
  } catch {
    /* no-op */
  }
}

export function captureException(err: unknown, context?: Record<string, any>) {
  if (!env.NEXT_PUBLIC_SENTRY_DSN) return;
  try {
    import('@sentry/nextjs').then((Sentry: SentryModule) => {
      Sentry.captureException(err, { extra: context || {} });
    });
  } catch {
    /* no-op */
  }
}
