import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';

type Invoice = Readonly<{
  id: string;
  amount: number;           // minor units
  currency: string;         // e.g. 'PKR' | 'USD'
  createdAt: string;        // ISO
  hostedInvoiceUrl?: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
}>;

type SubscriptionSummary = Readonly<{
  plan: 'starter' | 'booster' | 'master' | 'free';
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due';
  renewsAt?: string;
  trialEndsAt?: string;
}>;

const BillingPage: NextPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [sub, setSub] = React.useState<SubscriptionSummary | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        // You can later replace these stubs with a single /api/subscriptions/portal bootstrap call.
        const subRes = await fetch('/api/subscriptions/portal', { method: 'POST' });
        if (!subRes.ok) throw new Error('Failed to load subscription');
        const payload = await subRes.json();
        setSub(payload.subscription as SubscriptionSummary);
        setInvoices((payload.invoices ?? []) as Invoice[]);
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Head><title>Account — Billing</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Billing</h1>
              <p className="text-sm text-muted-foreground">Manage your plan, seats, and invoices.</p>
            </div>
            <Link href="/pricing" className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
              Change plan
            </Link>
          </div>

          {loading ? (
            <div className="rounded-lg border border-border p-4">Loading…</div>
          ) : err ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <p className="font-medium">Couldn’t load billing</p>
              <p className="text-sm opacity-90">{err}</p>
            </div>
          ) : (
            <>
              {/* Subscription Summary */}
              <section className="mb-8 rounded-xl border border-border p-4">
                <h2 className="mb-1 text-lg font-medium">Subscription</h2>
                <p className="text-sm text-muted-foreground">
                  Plan: <span className="font-medium capitalize">{sub?.plan ?? 'free'}</span> · Status:{' '}
                  <span className="font-medium">{sub?.status ?? '—'}</span>
                  {sub?.renewsAt ? <> · Renews on <time dateTime={sub.renewsAt}>{new Date(sub.renewsAt).toLocaleDateString()}</time></> : null}
                  {sub?.trialEndsAt ? <> · Trial ends <time dateTime={sub.trialEndsAt}>{new Date(sub.trialEndsAt).toLocaleDateString()}</time></> : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <form action="/api/subscriptions/portal" method="POST">
                    <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Open customer portal</button>
                  </form>
                  <Link href="/account/referrals" className="rounded-lg border border-border px-4 py-2 hover:bg-muted">
                    Get rewards via referrals
                  </Link>
                </div>
              </section>

              {/* Invoices */}
              <section className="rounded-xl border border-border p-4">
                <h2 className="mb-2 text-lg font-medium">Invoices</h2>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No invoices yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-b border-border/60">
                            <td className="py-2 pr-4">
                              <time dateTime={inv.createdAt}>
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </time>
                            </td>
                            <td className="py-2 pr-4">
                              {(inv.amount / 100).toLocaleString(undefined, { style: 'currency', currency: inv.currency })}
                            </td>
                            <td className="py-2 pr-4 capitalize">{inv.status}</td>
                            <td className="py-2 pr-4">
                              {inv.hostedInvoiceUrl ? (
                                <a
                                  href={inv.hostedInvoiceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline underline-offset-4"
                                >
                                  View
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default BillingPage;
