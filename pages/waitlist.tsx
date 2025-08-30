import React from 'react';
import Head from 'next/head';
import { Container } from '@/components/design-system/Container';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';

export default function WaitlistPage() {
  return (
    <>
      <Head>
        <title>Join the Waitlist • GramorX</title>
      </Head>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container className="max-w-xl">
          <h1 className="font-slab text-display text-center mb-8">Join the Waitlist</h1>
          <WaitlistForm />
        </Container>
      </section>
    </>
  );
}
