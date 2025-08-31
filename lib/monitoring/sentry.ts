import { env, isBrowser } from '@/lib/env';

export function initSentry() {
  if (!isBrowser || !env.NEXT_PUBLIC_SENTRY_DSN) return;
  if ((window as any).__sentry_inited) return;
  try {
    // @ts-expect-error TODO: add @sentry/nextjs to deps before enabling
    import('@sentry/nextjs').then((Sentry: any) => {
      Sentry.init({ dsn: env.NEXT_PUBLIC_SENTRY_DSN });
      (window as any).__sentry_inited = true;
    });
  } catch { /* no-op */ }
}

export function captureException(err: unknown, context?: Record<string, any>) {
  try {
    // @ts-expect-error see above TODO
    import('@sentry/nextjs').then((Sentry: any) => {
      Sentry.captureException(err, { extra: context || {} });
    });
  } catch { /* no-op */ }
}
