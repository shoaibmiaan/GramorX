// pages/premium/pin.tsx
import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PrCard } from '@/premium-ui/components/PrCard';
import { PrButton } from '@/premium-ui/components/PrButton';
import { ThemeSwitcher } from '@/premium-ui/theme/ThemeSwitcher';

export default function PremiumPinPage() {
  const router = useRouter();
  const nextUrl =
    typeof router.query.next === 'string' && router.query.next ? router.query.next : '/premium';

  const [pin, setPin] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);

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

      const data = await res.json().catch(() => ({} as any));
      setErr((data as any)?.error ?? 'Incorrect PIN. Try again.');
    } catch {
      setErr('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Enter Premium PIN</title>
      </Head>

      <main className="pr-relative pr-flex pr-items-center pr-justify-center pr-min-h-[100dvh] pr-p-4">
        <div className="pr-absolute pr-top-4 pr-right-4">
          <ThemeSwitcher />
        </div>

        <PrCard className="pr-w-full pr-max-w-md pr-p-6 pr-space-y-4">
          <h1 className="pr-text-xl pr-font-semibold">Enter Premium PIN</h1>
          <p className="pr-muted">Access the distraction-free Premium Exam Room.</p>

          <form onSubmit={submitPin} className="pr-space-y-4">
            <label className="pr-block">
              <span className="pr-mb-1.5 pr-inline-block pr-text-sm pr-muted">PIN</span>
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={loading}
                className="pr-w-full pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-bg-[color-mix(in oklab,var(--pr-card),white 4%)] pr-px-4 pr-py-3 focus:pr-outline-none focus:pr-ring-2 focus:pr-ring-[var(--pr-primary)]"
                placeholder="••••••"
              />
            </label>

            {err && <div className="pr-text-sm pr-text-[var(--pr-danger)]">{err}</div>}

            <PrButton type="submit" disabled={loading || !pin} className="pr-w-full">
              {loading ? 'Verifying…' : 'Unlock Premium'}
            </PrButton>

            <p className="pr-text-center pr-text-sm pr-muted">
              You’ll be redirected to <span className="pr-font-medium">{nextUrl}</span>.
            </p>
          </form>
        </PrCard>
      </main>
    </React.Fragment>
  );
}
