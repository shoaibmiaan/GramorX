// components/referrals/RedeemBox.tsx
import * as React from 'react';
import { redeemReferral } from '@/lib/api/referrals';

type Props = {
  onSuccess?: (rewardDays: number) => void;
  className?: string;
};

export default function RedeemBox({ onSuccess, className = '' }: Props) {
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);
    const res = await redeemReferral({ code, context: 'checkout' });
    if ('ok' in res && res.ok) {
      setMsg(`Applied! Reward: ${res.rewardDays} days`);
      onSuccess?.(res.rewardDays);
    } else {
      setErr((res as any).error || 'Invalid code');
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className={`rounded-xl border border-border p-3 ${className}`}>
      <label htmlFor="ref-code" className="mb-1 block text-sm font-medium">Have a referral code?</label>
      <div className="flex items-center gap-2">
        <input
          id="ref-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code (e.g., 9XH2LQ7B)"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <button
          type="submit"
          disabled={busy || code.trim().length < 6}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {busy ? 'Applying…' : 'Apply'}
        </button>
      </div>

      {msg ? <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{msg}</p> : null}
      {err ? <p className="mt-2 text-sm text-destructive">{err}</p> : null}
    </form>
  );
}
