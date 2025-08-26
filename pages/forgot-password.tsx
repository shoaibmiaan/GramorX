// pages/forgot-password.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const ForgotPassword: NextPage = () => {
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Could not send reset email. Please try again.');
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email. Please try again.');
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <main className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>

          {sent ? (
            <div className="rounded-md border p-4 text-sm">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 bg-transparent"
                  placeholder="you@example.com"
                />
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" className="rounded-md px-4 py-2 border">
                Send reset link
              </button>
            </form>
          )}

          <div className="mt-6 text-sm">
            {/* FIX: use Next <Link> for internal nav */}
            <Link href="/login" className="underline">Back to login</Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default ForgotPassword;
