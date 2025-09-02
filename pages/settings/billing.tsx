import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

type BillingState = {
  plan?: 'free' | 'starter' | 'booster' | 'master';
  status?: 'active' | 'canceled' | 'past_due' | 'none';
  renewal?: string | null; // ISO
  paymentMethod?: 'card' | 'none';
};

const Shell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="rounded-2xl border border-border bg-background/50 p-5 shadow-sm">{children}</div>
    </div>
  </div>
);

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [activated, setActivated] = useState<string | null>(null);

  useEffect(() => {
    // read URL params for post-checkout demo flow
    const url = new URL(window.location.href);
    setActivated(url.searchParams.get('activated'));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return setBilling({ plan: 'free', status: 'none', paymentMethod: 'none', renewal: null });

        // Try profiles table first (plan)
        let current: BillingState = { plan: 'free', status: 'none', paymentMethod: 'none', renewal: null };

        try {
          const { data: profile } = await supabase.from('profiles').select('membership_plan').eq('id', user.id).single();
          if (profile?.membership_plan) current.plan = profile.membership_plan as BillingState['plan'];
        } catch { /* ignore */ }

        // Optionally read a subscriptions table if present
        try {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status,current_period_end,payment_method,plan')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (sub) {
            current = {
              plan: (sub.plan ?? current.plan) as BillingState['plan'],
              status: (sub.status ?? 'active') as BillingState['status'],
              renewal: sub.current_period_end ?? null,
              paymentMethod: (sub.payment_method ?? 'card') as BillingState['paymentMethod'],
            };
          }
        } catch { /* ignore if table absent */ }

        setBilling(current);
      } catch {
        setBilling({ plan: 'free', status: 'none', paymentMethod: 'none', renewal: null });
      }
    })();
  }, []);

  return (
    <Shell title="Billing">
      {!billing ? (
        <div className="rounded-xl border border-border p-4 text-sm text-foreground/70">Loading…</div>
      ) : (
        <div className="grid gap-5">
          {activated ? (
            <div className="rounded-xl border border-border p-3 text-sm">
              ✅ Your plan setup is complete. Manage details below.
            </div>
          ) : null}

          <section className="rounded-xl border border-border p-4">
            <div className="text-sm font-medium">Current plan</div>
            <div className="mt-1 text-lg font-semibold capitalize">{billing.plan ?? 'free'}</div>
            <div className="mt-1 text-sm text-foreground/70">Status: {billing.status ?? 'none'}</div>
            {billing.renewal && (
              <div className="mt-1 text-sm text-foreground/70">
                Renews on {new Date(billing.renewal).toLocaleDateString()}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border p-4">
            <div className="text-sm font-medium">Payment method</div>
            <div className="mt-1 text-sm text-foreground/80">{billing.paymentMethod === 'card' ? 'Card on file' : 'None'}</div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary" disabled>
                Update card (soon)
              </button>
              <button className="rounded-lg border border-border px-3 py-1 text-sm hover:border-primary" disabled>
                Download invoices (soon)
              </button>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <Link href="/pricing" className="text-sm underline underline-offset-4">Change plan</Link>
            <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2 hover:border-primary">Go to dashboard</Link>
          </div>
        </div>
      )}
    </Shell>
  );
}
