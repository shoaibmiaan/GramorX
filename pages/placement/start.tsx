// pages/placement/start.tsx
import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export default function PlacementStartPage() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl text-gradient-primary mb-4">
          Quick Placement — Start
        </h1>
        <p className="text-grayish max-w-2xl mb-10">
          You’ll answer a few theory questions across Listening, Reading, Writing, and Speaking.
        </p>

        <Card className="p-8 rounded-ds-2xl card-surface space-y-6">
          <h2 className="text-h2 font-semibold">Before you begin</h2>
          <ul className="list-disc pl-6 text-body text-grayish space-y-1">
            <li>~10 minutes, no pauses</li>
            <li>Stable internet and a quiet place</li>
          </ul>

          <div className="flex gap-3">
            <Button as="a" href="/placement/quiz" variant="primary" className="rounded-ds-xl">
              Begin →
            </Button>
            <Button as="a" href="/placement" variant="secondary" className="rounded-ds-xl">
              Go back
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  );
}
