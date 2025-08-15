// components/sections/Specialties.tsx
import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

type Item = { icon: string; title: string; desc: string };

const ITEMS: Item[] = [
  { icon: '🤖', title: 'AI IELTS Coach', desc: 'Instant, actionable feedback for Writing & Speaking with band estimates and next steps.' },
  { icon: '🧪', title: 'Exam-exact Mock Tests', desc: 'Full IELTS format with timing, autosave, and section-wise review that feels like test day.' },
  { icon: '🧭', title: 'Adaptive Study Paths', desc: 'Personalized roadmap to your target band—what to study, in what order, and why.' },
  { icon: '⚡', title: 'Micro-Drills + Streaks', desc: 'Daily vocab and quick grammar drills with gamified streaks to build habits fast.' },
  { icon: '🎧', title: 'Listening Lab', desc: 'Auto-play per section, transcript toggle, and per-question review with answer highlights.' },
  { icon: '🎯', title: 'Strategy Tips Library', desc: 'Bite-sized tactics for Listening, Reading, Writing, and Speaking—use the same day.' },
  { icon: '📊', title: 'Progress & Analytics', desc: 'Band trajectory, weak-area detection, and smart nudges in a clean dashboard.' },
  { icon: '✨', title: 'Fast, Polished UX', desc: 'Modern, mobile-first UI with light/dark modes powered by our design system.' },
  { icon: '🔐', title: 'Trust & Access', desc: 'One-tap phone/email sign-in with privacy-minded, reliable infrastructure.' },
  { icon: '🧭', title: 'Friendly Free Tier', desc: '“Explorer” gives daily value; premium unlocks deep AI reviews and advanced analytics.' },
];

export const Specialties: React.FC<{ id?: string; className?: string }> = ({ id = 'features', className = '' }) => {
  return (
    <section id={id} className={`py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90 ${className}`}>
      <Container>
        <h2 className="font-slab text-h2 md:text-display text-gradient-primary">
          What makes GramorX different
        </h2>
        <p className="text-grayish max-w-2xl mt-2">
          Ten standout specialties you can market today.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <Card key={it.title} className="card-surface p-6 rounded-ds-2xl">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-ds bg-purpleVibe/10 text-2xl">
                  <span aria-hidden="true">{it.icon}</span>
                </span>
                <div>
                  <h3 className="text-h3 font-semibold mb-1">{it.title}</h3>
                  <p className="text-body text-gray-600 dark:text-grayish">{it.desc}</p>
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
