// pages/403.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

type Props = { reason?: string };

const ForbiddenPage: NextPage<Props> = () => {
  const reason: string | undefined = undefined;

  return (
    <>
      <Head>
        <title>403 — Forbidden</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-4xl font-bold mb-2">403</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You don’t have permission to access this page{reason ? `: ${reason}` : '.'}
          </p>
          <div className="mt-6">
            <Link href="/" className="inline-block rounded-md px-4 py-2 border">
              Go Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default ForbiddenPage;
