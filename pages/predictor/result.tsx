import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';
import BandBreakdown from '@/components/predictor/BandBreakdown';

type Result = Readonly<{
  overall: number;
  breakdown: { reading: number; listening: number; speaking: number; writing: number };
  confidence: number;
  advice: string[];
}>;

const PredictorResultPage: NextPage = () => {
  const [res, setRes] = React.useState<Result | null>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('predictor:last');
      if (raw) {
        const parsed = JSON.parse(raw) as { result: Result };
        setRes(parsed.result);
      }
    } catch {
      /* no-op */
    }
  }, []);

  return (
    <>
      <Head><title>Prediction Result</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-semibold">Your IELTS Estimate</h1>

          {!res ? (
            <div className="mt-6 rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                No result found. Please run the predictor first.
              </p>
              <Link href="/predictor" className="mt-3 inline-block rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                Go to Predictor
              </Link>
            </div>
          ) : (
            <>
              <BandBreakdown
                className="mt-6"
                overall={res.overall}
                breakdown={res.breakdown}
                confidence={res.confidence}
              />

              {res.advice.length > 0 ? (
                <section className="mt-6 rounded-xl border border-border p-4">
                  <h2 className="text-lg font-medium">Personalized Advice</h2>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                    {res.advice.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </section>
              ) : null}

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <Link href="/predictor" className="rounded-lg border border-border px-4 py-2 text-center hover:bg-muted">
                  Adjust inputs
                </Link>
                <Link href="/pricing" className="rounded-lg bg-primary px-4 py-2 text-center text-primary-foreground hover:opacity-90">
                  Unlock full prep
                </Link>
                <Link href="/account/referrals" className="rounded-lg border border-border px-4 py-2 text-center hover:bg-muted">
                  Get 14-day Booster via referral
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default PredictorResultPage;
