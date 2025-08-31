import * as React from 'react';
import { PrButton } from '@/premium-ui/components/PrButton';
import { PremiumThemeProvider } from '@/premium-ui/theme/PremiumThemeProvider';

type Props = {
  onSuccess?: () => void;
};

export function PinGate({ onSuccess }: Props) {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/premium/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onSuccess?.();
        return;
      }
      const data = await res.json().catch(() => ({} as any));
      setError((data as any)?.error ?? 'Invalid PIN');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PremiumThemeProvider>
      <form onSubmit={submit} className="pr-max-w-xs pr-mx-auto pr-space-y-4 pr-px-4 pr-py-20">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          disabled={loading}
          className="pr-w-full pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-bg-transparent pr-px-4 pr-py-2 focus:pr-border-[var(--pr-primary)] focus:pr-outline-none"
        />
        {error && <p className="pr-text-sm pr-text-[var(--pr-danger)]">{error}</p>}
        <PrButton type="submit" disabled={!pin || loading} className="pr-w-full">
          {loading ? 'Verifying…' : 'Unlock'}
        </PrButton>
      </form>
    </PremiumThemeProvider>
  );
}

