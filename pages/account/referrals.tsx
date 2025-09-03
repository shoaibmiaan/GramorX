import * as React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';

type CreateReferralResponse =
  | Readonly<{ ok: true; code: string }>
  | Readonly<{ ok: false; error: string }>;

const ReferralsPage: NextPage = () => {
  const [code, setCode] = React.useState<string>('');
  const [creating, setCreating] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = code ? `${origin}/pricing?code=${encodeURIComponent(code)}` : '';

  const createCode = React.useCallback(async () => {
    setCreating(true);
    setErr(null);
    try {
      const res = await fetch('/api/referrals/create', { method: 'POST' });
      const data = (await res.json()) as CreateReferralResponse;
      if (!res.ok || !('ok' in data) || !data.ok) {
        throw new Error((data as any)?.error || 'Failed to create referral code');
      }
      setCode(data.code);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setCreating(false);
    }
  }, []);

  const copy = React.useCallback(async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  }, [referralLink]);

  const share = React.useCallback(async () => {
    if (!referralLink) return;
    const text = `Join me on GramorX — get 14-day Booster free:\n${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'GramorX Referral' });
      } catch {
        /* noop */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }, [referralLink]);

  return (
    <>
      <Head><title>Account — Referrals</title></Head>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-semibold">Referrals</h1>
          <p className="text-sm text-muted-foreground">
            Invite friends and both of you get a <span className="font-medium">14-day Booster</span> reward. {/* per tracker */ }
          </p>

          <div className="mt-6 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={createCode}
                disabled={creating}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-60"
              >
                {creating ? 'Generating…' : (code ? 'Regenerate Code' : 'Generate My Code')}
              </button>

              {code ? (
                <>
                  <code className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-sm">
                    {code}
                  </code>
                  <button
                    type="button"
                    onClick={copy}
                    className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
                  >
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
                  >
                    Share
                  </button>
                </>
              ) : null}
            </div>

            {code ? (
              <p className="mt-3 text-sm">
                Your link:{' '}
                <a href={referralLink} className="underline underline-offset-4" target="_blank" rel="noreferrer">
                  {referralLink}
                </a>
              </p>
            ) : null}

            {err ? (
              <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <p className="font-medium">Error</p>
                <p className="opacity-90">{err}</p>
              </div>
            ) : null}
          </div>

          <ul className="mt-6 list-disc pl-5 text-sm text-muted-foreground">
            <li>Friends can paste your code at signup or checkout to redeem.</li>
            <li>Fraud protection applies; rewards may take a few minutes to appear.</li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default ReferralsPage;
