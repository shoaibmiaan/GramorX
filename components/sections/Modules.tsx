// components/sections/Modules.tsx
import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Section } from '@/components/design-system/Section';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';

type Item = {
  status: 'COMPLETE' | 'IN PROGRESS';
  icon: string;
  title: string;
  bullets: string[];
  href?: string;
};

const items: Item[] = [
  {
    status: 'COMPLETE',
    icon: 'fa-user',
    title: 'User Module',
    bullets: [
      'Auth (email/social/phone)',
      'Profiles & goal band',
      'Roles (student/teacher/admin)',
      'Daily streak + calendar',
      'Bookmarks',
      'Language preferences',
    ],
    href: '/settings',
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-book',
    title: 'Learning Module',
    bullets: [
      'Structured courses (A/G)',
      'Grammar & vocabulary',
      'Strategy guides',
      'AI drills',
      'Unlockable paths',
      'Phrasebank',
    ],
    href: '/learning',
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-clipboard-list',
    title: 'Mock Test Module',
    bullets: [
      'Full-length timed mocks',
      'Section-wise practice',
      'Band simulation',
      'Real-time timer',
      'Tab-switch detection',
      'Per-test analytics',
    ],
    href: '/mock',
  },
  {
    status: 'COMPLETE',
    icon: 'fa-robot',
    title: 'AI Evaluation',
    bullets: [
      'Writing Task 1 & 2',
      'Letter (GT)',
      'Speaking audio eval',
      'Transcription + pron',
      'Model answers',
      'AI re-evaluation',
    ],
    href: '/ai',
  },
  {
    status: 'COMPLETE',
    icon: 'fa-microphone',
    title: 'Speaking Practice',
    bullets: [
      'Simulator (Parts 1–3)',
      'Record & playback',
      'AI speaking partner',
      'Accent adaptation',
      'Roleplay',
      'Speaking report',
    ],
    href: '/speaking',
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-chart-line',
    title: 'Performance Analytics',
    bullets: [
      'Band trajectory',
      'Weekly/monthly reports',
      'Weakness detection',
      'Study time tracker',
      'Leaderboard & percentile',
      'AI improvement plan',
    ],
    href: '/progress',
  },
];

export const Modules: React.FC = () => {
  return (
    <Section id="modules">
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">COMPREHENSIVE IELTS MODULES</h2>
          <p className="text-muted-foreground text-lg">AI + proven pedagogy for faster score gains</p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => {
            const complete = m.status === 'COMPLETE';
            return (
              <Card key={m.title} className="p-7 rounded-2xl relative hover:-translate-y-2 transition hover:shadow-glow">
                <Badge variant={complete ? 'success' : 'warning'} size="sm" className="absolute top-4 right-4">
                  {m.status}
                </Badge>

                <div className="w-17.5 h-17.5 rounded-full flex items-center justify-center mb-6 text-white text-2xl bg-gradient-to-br from-purpleVibe to-electricBlue">
                  <i className={`fas ${m.icon}`} aria-hidden="true" />
                </div>

                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <i className="fas fa-circle-check text-neonGreen" aria-hidden="true" />
                  {m.title}
                </h3>

                <ul className="mt-2">
                  {m.bullets.map((b) => (
                    <li key={b} className="py-2 pl-6 border-b border-dashed border-purpleVibe/20 relative text-mutedText dark:text-mutedText">
                      <span className="absolute left-0 top-2 text-neonGreen font-bold">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                {m.href && (
                  <div className="mt-4">
                    <Link href={m.href} className="inline-flex items-center gap-2 text-electricBlue hover:underline">
                      Open <i className="fas fa-arrow-right" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};
