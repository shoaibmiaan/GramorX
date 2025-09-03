import * as React from 'react';

type PlanKey = 'starter' | 'booster' | 'master';
type Cycle = 'monthly' | 'annual';
type Method = 'stripe' | 'easypaisa' | 'jazzcash';

type CreateCheckoutBody = Readonly<{
  plan: PlanKey;
  referralCode?: string;
  billingCycle?: Cycle;
}>;

type CreateCheckoutResponse =
  | Readonly<{ ok: true; url: string; sessionId?: string }>
  | Readonly<{ ok: false; error: string }>;

export type CheckoutFormProps = {
  plan: PlanKey;
  billingCycle?: Cycle;
  referralCode?: string;
  methods?: Method[]; // default: all
  className?: string;
  onError?: (msg: string) => void;
};

export default function CheckoutForm({
  plan,
  billingCycle = 'monthly',
  referralCode,
  methods = ['stripe', 'easypaisa', 'jazzcash'],
  className = '',
  onError,
}: CheckoutFormProps) {
  const [loading, setLoading] = React.useState<Method | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const start = React.useCallback(async (method: Method) => {
    setErr(null);
    setLoading(method);

    const body: CreateCheckoutBody = { plan, referralCode, billingCycle };
    const endpoint =
      method === 'stripe'
        ? '/api/payments/create-checkout-session'
        : method === 'easypaisa'
        ? '/api/payments/create-easypaisa-session'
        : '/api/payments/create-jazzcash-session';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as CreateCheckoutResponse;

      if (!res.ok || !('ok' in data) || !data.ok) {
        const message = (data as any)?.error || `Failed to start ${method} checkout`;
        setErr(message);
        onError?.(message);
        setLoading(null);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      const message = (e as Error).message;
      setErr(message);
      onError?.(message);
      setLoading(null);
    }
  }, [plan, referralCode, billingCycle, onError]);

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {methods.includes('stripe') && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-1 text-lg font-medium">Pay by Card</h3>
          <p className="mb-4 text-sm text-muted-foreground">Visa, MasterCard</p>
          <button
            type="button"
            onClick={() => start('stripe')}
            disabled={loading !== null}
            className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
          >
            {loading === 'stripe' ? 'Starting…' : 'Continue with Card'}
          </button>
        </div>
      )}

      {methods.includes('easypaisa') && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-1 text-lg font-medium">Easypaisa</h3>
          <p className="mb-4 text-sm text-muted-foreground">Pakistan local payments</p>
          <button
            type="button"
            onClick={() => start('easypaisa')}
            disabled={loading !== null}
            className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
          >
            {loading === 'easypaisa' ? 'Starting…' : 'Pay with Easypaisa'}
          </button>
        </div>
      )}

      {methods.includes('jazzcash') && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-1 text-lg font-medium">JazzCash</h3>
          <p className="mb-4 text-sm text-muted-foreground">Pakistan local payments</p>
          <button
            type="button"
            onClick={() => start('jazzcash')}
            disabled={loading !== null}
            className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
          >
            {loading === 'jazzcash' ? 'Starting…' : 'Pay with JazzCash'}
          </button>
        </div>
      )}

      {err ? (
        <div className="md:col-span-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Checkout error</p>
          <p className="opacity-90">{err}</p>
        </div>
      ) : null}
    </div>
  );
}
