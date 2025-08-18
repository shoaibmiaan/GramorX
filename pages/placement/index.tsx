// pages/placement/index.tsx (PlacementHome)
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Alert } from '@/components/design-system/Alert';
import { GradientText } from '@/components/design-system/GradientText';

export default function PlacementHome() {
  return (
    <>
      <Head><title>Placement | GramorX</title></Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h1 className="font-slab text-display">
                <GradientText>Quick Placement</GradientText>
              </h1>
              <p className="text-grayish max-w-xl mt-3">
                8 exam‑pattern items (2 per skill) to estimate your current band
                and unlock a personalized plan.
              </p>

              <div className="mt-6 flex gap-3">
                <Link href="/placement/run" passHref legacyBehavior>
                  <Button as="a" variant="primary" className="rounded-ds-xl">
                    Start placement
                  </Button>
                </Link>

                <Link href="/learning" passHref legacyBehavior>
                  <Button as="a" variant="secondary" className="rounded-ds-xl">
                    View strategies
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex gap-2">
                <Badge variant="info">~10–15 min</Badge>
                <Badge variant="success">Exact IELTS patterns</Badge>
              </div>
            </div>

            <Card className="p-6 rounded-ds-2xl">
              <Alert title="How it works" variant="info" />
              <ol className="list-decimal pl-5 mt-3 space-y-2 text-body">
                <li>Answer 8 exam‑style items (2 Listening, 2 Reading, 2 Writing, 2 Speaking).</li>
                <li>We estimate band per skill (0–9).</li>
                <li>Get your study plan + first tasks.</li>
              </ol>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}
