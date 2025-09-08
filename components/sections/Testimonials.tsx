import { Icon } from "@/components/design-system/Icon";
// components/sections/Testimonials.tsx
import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';
import { Card } from '@/components/design-system/Card';

export type Testimonial = {
  id: string;
  name: string;
  band: string;
  quote: string;
  context: 'Academic' | 'General Training';
  location?: string;
};

const items: readonly Testimonial[] = [
  {
    id: 't1',
    name: 'Hina S.',
    band: '7.5',
    quote:
      'AI feedback on my Task 2 essays was brutally honest but specific. I fixed coherence issues and jumped from 6.5 to 7.5.',
    context: 'Academic',
    location: 'Lahore',
  },
  {
    id: 't2',
    name: 'Umair R.',
    band: '8.0',
    quote:
      'The Speaking simulator felt like the real interview. Recording + instant transcript helped me trim fillers.',
    context: 'General Training',
    location: 'Dubai',
  },
  {
    id: 't3',
    name: 'Ayesha T.',
    band: '7.0',
    quote:
      'Listening drills and timing pressure are spot on. My section scores became consistent before exam day.',
    context: 'Academic',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <Section id="testimonials">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-slab text-h2 tracking-tight text-gradient-primary">Learners Who Leveled Up</h2>
          <p className="text-muted-foreground mt-2">Real prep. Real gains. Repeatable process.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <Card
              key={t.id}
              className="p-6 rounded-ds-2xl border border-purpleVibe/20 hover:border-purpleVibe/40 transition bg-card/70"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.name}</div>
                <div className="text-electricBlue font-bold" aria-label={`Band score ${t.band}`}>
                  Band {t.band}
                </div>
              </div>
              <div className="text-small text-muted-foreground mt-0.5">
                {t.context}
                {t.location ? ` • ${t.location}` : ''}
              </div>

              <blockquote className="mt-4 relative pl-4 border-l-4 border-border text-mutedText">
                “{t.quote}”
              </blockquote>

              <div className="mt-5 flex items-center gap-1 text-warning/90" aria-hidden="true">
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star" />
                <Icon name="star-half-alt" />
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-ds border border-border hover:bg-electricBlue/5 transition"
          >
            Read more reviews <Icon name="arrow-right" />
          </Link>
        </div>
      </Container>
    </Section>
  );
};

export default Testimonials;
