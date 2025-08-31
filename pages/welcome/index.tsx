import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export default function WelcomePage() {
  const modules = [
    { name: 'Listening', href: '/listening' },
    { name: 'Reading', href: '/reading' },
    { name: 'Writing', href: '/writing' },
    { name: 'Speaking', href: '/speaking' },
  ];

  return (
    <section className="py-24 bg-lightBg dark:bg-dark/80 min-h-screen">
      <Container className="max-w-2xl">
        <Card className="p-8 space-y-6 text-center">
          <h1 className="font-slab text-h2">Welcome to GramorX</h1>
          <p className="text-body text-mutedText">
            Kickstart your IELTS prep with our AI-powered modules.
          </p>
          <ul className="grid gap-3 text-left">
            {modules.map((m) => (
              <li key={m.name}>
                <Link href={m.href} className="text-primaryDark underline hover:no-underline">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild className="rounded-ds-xl">
            <Link href="/onboarding">Begin Onboarding</Link>
          </Button>
        </Card>
      </Container>
    </section>
  );
}
