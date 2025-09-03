import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import { Section } from '@/components/design-system/Section';
import { Container } from '@/components/design-system/Container';

const CancelPage: NextPage = () => {
  const router = useRouter();
  const plan = String(router.query.plan ?? 'booster');
  const code = router.query.code ? String(router.query.code) : undefined;

  const retryHref = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('plan', plan);
    if (code) params.set('code', code);
    return `/checkout?${params.toString()}`;
  }, [plan, code]);

  return (
    <>
      <Head><title>Checkout Canceled</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <Section>
          <Container className="max-w-3xl px-4 text-center">
            <h1 className="mb-2 text-3xl font-semibold">Checkout canceled</h1>
            <p className="text-muted-foreground">
              No worries — your card hasn’t been charged.
            </p>

            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3">
              <Link href={retryHref} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
                Try again
              </Link>
              <Link href="/pricing" className="rounded-lg border border-border px-4 py-2 hover:bg-muted">
                Back to pricing
              </Link>
            </div>
          </Container>
        </Section>
      </main>
    </>
  );
};

export default CancelPage;
