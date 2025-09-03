// components/sections/Specialties.tsx
import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';

type Specialty = {
  title: string;
  desc: string;
  icon: string; // font-awesome class
  href: string;
  label?: string;
};

const specialties: readonly Specialty[] = [
  {
    title: 'Adaptive Paths',
    desc: 'Route practice based on weak skills, pace, and target band.',
    icon: 'fa-route',
    href: '/learning',
    label: 'AI',
  },
  {
    title: 'Realistic Mocks',
    desc: 'Exam-like timer, auto-save, tab-switch detection, and review.',
    icon: 'fa-clipboard-list',
    href: '/mock',
    label: 'Exam Room',
  },
  {
    title: 'Instant Feedback',
    desc: 'Writing band estimates, speaking transcription, and next steps.',
    icon: 'fa-robot',
    href: '/ai',
    label: 'Evaluation',
  },
  {
    title: 'Progress Reports',
    desc: 'Band trajectory trends, accuracy per type, pace vs accuracy.',
    icon: 'fa-chart-line',
    href: '/progress',
    label: 'Analytics',
  },
];

export const Specialties: React.FC = () => {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="font-slab text-h2 tracking-tight text-gradient-primary">What Makes Us Different</h2>
          <p className="text-grayish mt-2">Deep focus on IELTS outcomes with maximum AI involvement.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {specialties.map((s) => (
            <Card key={s.title} className="p-6 rounded-ds-2xl border border-purpleVibe/20 hover:border-purpleVibe/40 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full grid place-items-center text-white bg-gradient-to-br from-purpleVibe to-electricBlue">
                  <i className={`fas ${s.icon}`} aria-hidden />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-h4">{s.title}</h3>
                    {s.label && <Badge variant="info" size="xs">{s.label}</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1">{s.desc}</p>
                  <div className="mt-3">
                    <Link href={s.href} className="text-electricBlue hover:underline inline-flex items-center gap-2">
                      Explore <i className="fas fa-arrow-right" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Specialties;
