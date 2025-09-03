import React from 'react';
import Head from 'next/head';
import { Section } from '@/components/design-system/Section';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';

export default function WaitlistPage() {
  return (
    <>
      <Head>
        <title>Join the Waitlist • GramorX</title>
      </Head>
      <Section Container containerClassName="max-w-xl">
        <h1 className="font-slab text-display text-center mb-8">Join the Waitlist</h1>
        <WaitlistForm />
      </Section>
    </>
  );
}
