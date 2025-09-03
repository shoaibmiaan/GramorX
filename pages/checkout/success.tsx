import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { track } from '@/lib/analytics/track';

const SuccessPage: NextPage = () => {
  const router = useRouter();
  const sessionId = String(router.query.session_id ?? '');
  const plan = String(router.query.plan ?? 'booster');

  React.useEffect(() => {
    if (sessionId) {
      track('plan_purchased', { providerSessionId: sessionId, plan });
    }
  }, [sessionId, plan]);

  return (
    <>
      <Head><title>Payment Successful</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="mb-2 text-3xl font-semibold">You’re upgraded! 🎉</h1>
          <p className="text-muted-foreground">
            Your subscription is active. You can now access full IELTS modules, AI feedback, and analytics.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <Link href="/dashboard" className="rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground hover:opacity-90">
              Go to Dashboard
            </Link>
            <Link href="/account/billing" className="rounded-lg border border-border px-4 py-2 text-center hover:bg-muted">
              View invoices
            </Link>
            <Link href="/account/referrals" className="rounded-lg border border-border px-4 py-2 text-center hover:bg-muted">
              Invite a friend (get rewards)
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            If you closed the window accidentally, your receipt will also be emailed.
          </p>
        </div>
      </main>
    </>
  );
};

export default SuccessPage;
