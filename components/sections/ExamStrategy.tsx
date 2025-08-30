import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { NavLink } from '@/components/design-system/NavLink';

export default function ExamStrategy() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-slab text-h1 md:text-display">IELTS Exam Strategy</h2>
            <p className="text-grayish mt-1">
              A simple path: learn key strategies → practise each module → get AI feedback → re‑evaluate & improve.
            </p>
          </div>
          <Badge variant="info" size="sm">Start here</Badge>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* 1. Foundations */}
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h3 className="text-h3">1) Foundations</h3>
            <ul className="mt-3 space-y-2 text-grayish">
              <li>• Understand band descriptors (TR/CC/LR/GRA)</li>
              <li>• Learn time management per module</li>
              <li>• Build exam‑day checklist</li>
            </ul>
            <div className="mt-5 flex gap-3">
              <Button href="/learning/strategies?area=all" variant="secondary" className="rounded-ds-xl">
                Read strategies
              </Button>
            </div>
          </Card>

          {/* 2. Practise with AI */}
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h3 className="text-h3">2) Practise with AI</h3>
            <ul className="mt-3 space-y-2 text-grayish">
              <li>• Writing Task 1/2 or GT letter → instant band & tips</li>
              <li>• Listening/Reading drills with live inputs</li>
              <li>• Speaking: record → STT → pronunciation & feedback</li>
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button href="/writing" variant="primary" className="rounded-ds-xl">Try Writing</Button>
              <Button href="/listening" variant="secondary" className="rounded-ds-xl">Try Listening</Button>
            </div>
          </Card>

          {/* 3. Review & Improve */}
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h3 className="text-h3">3) Review & Improve</h3>
            <ul className="mt-3 space-y-2 text-grayish">
              <li>• Compare scores vs goals & identify gaps</li>
              <li>• Use <b>AI Re‑evaluation</b> to test strict/coaching modes</li>
              <li>• Track progress; repeat weak areas</li>
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button href="/writing" variant="secondary" className="rounded-ds-xl">Open Review</Button>
              <Button href="/reading" variant="secondary" className="rounded-ds-xl">Open Reading</Button>
            </div>
          </Card>
        </div>

        {/* Quick access to all four modules */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Listening', href: '/listening' },
            { label: 'Reading', href: '/reading' },
            { label: 'Writing', href: '/writing' },
            { label: 'Speaking', href: '/speaking' },
          ].map(x => (
            <NavLink
              key={x.href}
              href={x.href}
              className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10 hover:bg-electricBlue/5 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{x.label}</span>
                <i className="fas fa-arrow-right text-grayish" aria-hidden="true" />
              </div>
            </NavLink>
          ))}
        </div>
      </Container>
    </section>
  );
}
