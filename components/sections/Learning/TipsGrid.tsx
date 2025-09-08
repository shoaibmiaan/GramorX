import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

const SKILLS = [
  { key: 'listening', title: 'Listening Strategy', blurb: 'Maps, MCQs, and note-taking tricks.' },
  { key: 'reading',  title: 'Reading Strategy',  blurb: 'Skimming vs. scanning; T/F/NG.' },
  { key: 'writing',  title: 'Writing Strategy',  blurb: 'Task 1 visuals; Task 2 structure.' },
  { key: 'speaking', title: 'Speaking Strategy', blurb: 'Fluency, coherence, lexical range.' },
];

export const TipsGrid: React.FC = () => (
  <section className="py-24 bg-background dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90" id="tips">
    <Container>
      <h2 className="font-slab text-h2">IELTS Strategy Tips</h2>
      <p className="text-muted-foreground mb-8">Four skills, concise and practical.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map((s) => (
          <Card key={s.key} className="card-surface p-6 rounded-ds-2xl">
            <h3 className="text-h3">{s.title}</h3>
            <p className="text-muted-foreground mt-2">{s.blurb}</p>
            {/* route to strategies with prefilter */}
            <Button
              as="a"
              href={`/learning/strategies?area=${s.key}`}
              variant="secondary"
              className="mt-6 w-full rounded-ds-xl"
            >
              View Tips
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  </section>
);
