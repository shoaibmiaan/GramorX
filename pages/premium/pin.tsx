// pages/premium/pin.tsx
import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLocale } from '@/lib/locale';
import { PremiumThemeProvider } from '@/premium-ui/theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '@/premium-ui/theme/ThemeSwitcher';
import { PrButton } from '@/premium-ui/components/PrButton';
import { PrCard } from '@/premium-ui/components/PrCard';

function isInternalRoute(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//') && !url.includes('://');
}

type VerifyPinError = { error?: string };

export default function PremiumPinPage() {
  const router = useRouter();
  const { t } = useLocale();

  // Sanitize the redirect target
  const rawNext =
    typeof router.query.next === 'string' && router.query.next ? router.query.next : '/premium';
  const nextUrl = isInternalRoute(rawNext) ? rawNext : '/premium';

  const [pin, setPin] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submitPin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!pin || loading) return;

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch('/api/premium/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        // Cookie pr_pin_ok=1 is set by the API; middleware will now allow /premium/*
        router.replace(nextUrl);
        return;
      }

      const data: VerifyPinError = await res.json().catch(() => ({} as VerifyPinError));
      setErr(data.error ?? 'Incorrect PIN. Try again.');
    } catch {
      setErr('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumThemeProvider>
      <>
        <Head>
          <title>Enter Premium PIN</title>
        </Head>

        <main className="pr-grid pr-place-items-center pr-min-h-[100dvh] pr-p-4">
          <div className="pr-absolute pr-top-4 pr-right-4">
            <ThemeSwitcherPremium />
          </div>

          <section className="pr-w-full pr-max-w-md pr-mx-auto pr-p-2">
            <PrCard className="pr-p-6 md:pr-p-8">
              <h1 className="pr-font-semibold pr-text-2xl pr-mb-2">Enter Premium PIN</h1>
              <p className="pr-muted pr-mb-6">
                Access the distraction-free Premium Exam Room.
              </p>

              <form onSubmit={submitPin} className="pr-space-y-4" noValidate>
                <label className="pr-block">
                  <span className="pr-mb-1.5 pr-inline-block pr-text-sm pr-muted">PIN</span>
                  <input
                    ref={inputRef}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Premium PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={loading}
                    className="pr-w-full pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-bg-transparent pr-px-4 pr-py-3 focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-[var(--pr-primary)] focus:pr-border-[var(--pr-primary)]"
                    placeholder="••••••"
                  />
                </label>

                {err && (
                  <div
                    role="alert"
                    className="pr-rounded-xl pr-border pr-border-[var(--pr-danger)] pr-bg-[color-mix(in oklab,var(--pr-danger),var(--pr-bg) 85%)] pr-text-[var(--pr-danger)] pr-p-3 pr-text-sm"
                  >
                    {err}
                  </div>
                )}

                <PrButton
                  type="submit"
                  disabled={loading || !pin}
                  className="pr-w-full pr-justify-center"
                >
                  {loading ? 'Verifying…' : 'Unlock Premium'}
                </PrButton>

                <p className="pr-text-sm pr-muted pr-text-center">
                  You’ll be redirected to <span className="pr-font-medium">{nextUrl}</span>.
                </p>
              </form>

              <p className="pr-text-sm pr-muted pr-text-center pr-mt-4">
                {t('premiumPin.info')}{' '}
                {t('premiumPin.noPinPrefix')}{' '}
                <a href="mailto:support@gramorx.com" className="pr-link">
                  {t('premiumPin.contactSupport')}
                </a>{' '}
                {t('premiumPin.or')}{' '}
                <Link href="/pricing" className="pr-link">
                  {t('premiumPin.viewPricing')}
                </Link>
                .
              </p>
            </PrCard>
          </section>
        </main>
      </>
    </PremiumThemeProvider>
  );
}
