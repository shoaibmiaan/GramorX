import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { scenarios } from '@/data/roleplay/scenarios';

export default function RoleplayHome() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-h1 md:text-display">Roleplay Scenarios</h1>
        <p className="text-grayish mt-2">Pick a real-life conversation to practice.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {scenarios.map(s => (
            <Card key={s.slug} className="card-surface p-6 rounded-ds-2xl">
              <Badge variant="warning">Roleplay</Badge>
              <h3 className="text-h3 mt-3">{s.title}</h3>
              <p className="text-grayish mt-1 line-clamp-3">{s.intro}</p>
              <Button as={Link} href={`/speaking/roleplay/${s.slug}`} variant="secondary" className="mt-6 rounded-ds-xl">
                Start
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button as={Link} href="/speaking" variant="secondary" className="rounded-ds-xl">Back</Button>
        </div>
      </Container>
    </section>
  );
}
