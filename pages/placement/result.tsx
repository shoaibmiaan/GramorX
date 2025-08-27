// pages/placement/result.tsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { GradientText } from '@/components/design-system/GradientText';
import { PREFS } from '@/lib/profile-options';

export default function PlacementResult() {
  return (
    <>
      <Head><title>Placement Result | GramorX</title></Head>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <h1 className="font-slab text-display mb-3"><GradientText>Your estimated bands</GradientText></h1>
          <Card className="p-6 rounded-ds-2xl">
            <div className="grid sm:grid-cols-4 gap-4 text-center">
              {PREFS.map(s=>(
                <div key={s} className="p-4 rounded-ds border border-gray-200 dark:border-white/10">
                  <div className="text-small opacity-80">{s}</div>
                  <div className="text-h1">—</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Link href="/learning" passHref legacyBehavior>
                <Button as="a" variant="primary" className="rounded-ds">See your plan</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}
