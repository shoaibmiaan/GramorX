// pages/403.tsx
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Container } from '@/components/design-system/Container';

type Props = { reason: string | null };

const jokes = [
  "403: Even AI tutors need permission slips.",
  "Access denied — unlike IELTS, you can’t guess the answer here.",
  "You’re not lost, just unauthorized. Happens to the best of us!",
  "This page is like Task 2 without preparation: inaccessible.",
  "403: The band score for access is 9.0 — you got a solid 0.",
];

const ForbiddenPage: NextPage<Props> = ({ reason }) => {
  const joke = useMemo(
    () => jokes[Math.floor(Math.random() * jokes.length)],
    []
  );

  return (
    <>
      <Head>
        <title>403 — Forbidden</title>
      </Head>
      <main className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground px-6">
        <Container>
          <Card className="p-10 text-center space-y-6">
            <h1 className="text-6xl font-bold text-primary">403</h1>
            <p className="text-lg text-mutedText">
              You don’t have permission to access this page
              {reason ? `: ${reason}` : '.'}
            </p>
            <p className="italic text-accent">{joke}</p>
            <div className="mt-6">
              <Link href="/" passHref legacyBehavior>
                <Button variant="primary">Go Home</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  // Explicitly return null instead of undefined to avoid Next.js serialization error
  return { props: { reason: null } };
};

export default ForbiddenPage;
