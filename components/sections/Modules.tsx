import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';

const items = [
  {
    status: 'COMPLETE',
    icon: 'fa-user',
    title: 'User Module',
    bullets: [
      'User registration & login (email/social/phone)',
      'Profile setup with goal band and level',
      'Role-based access (student/teacher/admin)',
      'Daily streak tracking & study calendar',
      'Bookmarking system for content',
      'Multi-language preference settings',
    ],
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-book',
    title: 'Learning Module',
    bullets: [
      'Structured courses (Academic & General)',
      'Grammar & vocabulary lessons',
      'IELTS strategy guides for all skills',
      'AI-generated practice drills',
      'Progressively unlocked learning paths',
      'Collocations and phrasebank',
    ],
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-clipboard-list',
    title: 'Mock Test Module',
    bullets: [
      'Full-length timed IELTS mock tests',
      'Section-wise practice tests',
      'Band score simulation',
      'Real-time test timer',
      'Tab-switch detection',
      'Performance analytics per test',
    ],
  },
  {
    status: 'COMPLETE',
    icon: 'fa-robot',
    title: 'AI Evaluation Module',
    bullets: [
      'Writing Task 1 & 2 feedback with band score',
      'Letter writing for General Training',
      'Speaking audio evaluation',
      'Transcription + pronunciation scoring',
      'Instant feedback with model answers',
      'AI re-evaluation option',
    ],
  },
  {
    status: 'COMPLETE',
    icon: 'fa-microphone',
    title: 'Speaking Practice',
    bullets: [
      'Speaking test simulator (Parts 1-3)',
      'Voice recording and playback',
      'AI-powered speaking partner',
      'Accent adaptation (UK, US, AUS)',
      'Roleplay conversations',
      'Detailed speaking report',
    ],
  },
  {
    status: 'IN PROGRESS',
    icon: 'fa-chart-line',
    title: 'Performance Analytics',
    bullets: [
      'Skill-wise band progression',
      'Weekly/monthly performance reports',
      'Weakness detection & suggestions',
      'Study time tracker',
      'Leaderboard and percentile rank',
      'AI-generated improvement plan',
    ],
  },
];

export const Modules: React.FC = () => {
  return (
    <section
      id="modules"
      className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90"
    >
      <Container>
        <div className="text-center mb-16">
          <h2 className="font-slab text-4xl mb-3 text-gradient-primary">
            COMPREHENSIVE IELTS PREPARATION MODULES
          </h2>
          <p className="text-grayish text-lg">
            Our platform combines cutting-edge AI technology with proven
            teaching methodologies
          </p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => {
            const isComplete = m.status === 'COMPLETE';
            return (
              <Card
                key={m.title}
                className="p-7 rounded-2xl relative hover:-translate-y-2 transition hover:shadow-glow"
              >
                <Badge
                  variant={isComplete ? 'success' : 'warning'}
                  size="sm"
                  className="absolute top-4 right-4"
                >
                  {m.status}
                </Badge>

                <div className="w-17.5 h-17.5 rounded-full flex items-center justify-center mb-6 text-white text-2xl bg-gradient-to-br from-purpleVibe to-electricBlue">
                  <i className={`fas ${m.icon}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <i className="fas fa-circle-check text-neonGreen"></i>
                  {m.title}
                </h3>
                <ul className="mt-2">
                  {m.bullets.map((b) => (
                    <li
                      key={b}
                      className="py-2 pl-6 border-b border-dashed border-purpleVibe/20 relative text-mutedText dark:text-mutedText"
                    >
                      <span className="absolute left-0 top-2 text-neonGreen font-bold">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
};