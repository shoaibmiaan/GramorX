import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export default function Forbidden() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-10 text-center rounded-ds-2xl">
          <h1 className="font-slab text-4xl mb-3 text-gradient-primary">Access denied</h1>
          <p className="text-grayish mb-6">You don’t have permission to view this page.</p>
          <div className="flex gap-3 justify-center">
            <Button as="a" href="/" variant="primary">Go Home</Button>
            <Button as="a" href="/login" variant="secondary">Switch Account</Button>
          </div>
        </Card>
      </Container>
    </section>
  );
}
