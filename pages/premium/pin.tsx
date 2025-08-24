// pages/premium/pin.tsx
import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

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

      <main className="min-h-screen grid place-items-center bg-lightBg text-lightText dark:bg-gradient-to-br dark:from-darker dark:to-dark dark:text-white">
        <section className="w-full max-w-md mx-auto p-6">
          <div className="card-surface rounded-ds-2xl border border-purpleVibe/20 p-6 md:p-8 shadow-sm">
            <h1 className="font-slab text-h2 mb-2">Enter Premium PIN</h1>
            <p className="text-grayish mb-6">Access the distraction-free Premium Exam Room.</p>

            <form onSubmit={submitPin} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 inline-block text-small text-gray-600 dark:text-grayish">
                  PIN
                </span>
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-ds border bg-white text-lightText placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-dark/50 dark:text-white dark:placeholder-white/40 dark:border-purpleVibe/30 dark:focus:ring-electricBlue dark:focus:border-electricBlue py-3 px-4"
                  placeholder="••••••"
                />
              </label>

              {err && (
                <div className="card-surface border border-sunsetOrange/30 text-sunsetOrange rounded-ds p-3 text-small">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !pin}
                className="inline-flex items-center justify-center w-full rounded-ds-xl px-4 py-3 bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Unlock Premium'}
              </button>

              <p className="text-small text-grayish text-center">
                You’ll be redirected to <span className="font-medium">{nextUrl}</span>.
              </p>
            </form>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
}
