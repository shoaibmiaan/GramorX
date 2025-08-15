// components/modules/ExamStrategy.tsx
import React from 'react';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Alert } from '@/components/design-system/Alert';

type Bullet = { title: string; body: string };
type Section = { heading: string; bullets: Bullet[] };

export const ExamStrategy: React.FC<{
  moduleName: 'Writing' | 'Listening' | 'Reading' | 'Speaking';
  intro?: string;
  sections: Section[];
  onStart?: () => void;
  ctaLabel?: string;
}> = ({ moduleName, intro, sections, onStart, ctaLabel = 'Start practice' }) => {
  return (
    <Card className="card-surface p-6 rounded-ds-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm">Start here</Badge>
            <span className="text-small text-grayish">Exam Strategy · {moduleName}</span>
          </div>
          <h3 className="text-h3 mt-2">{moduleName} — Strategy & Gameplan</h3>
          {intro && <p className="text-grayish mt-1 max-w-2xl">{intro}</p>}
        </div>
        {onStart && (
          <Button onClick={onStart} variant="primary" className="rounded-ds-xl">
            {ctaLabel}
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {sections.map((s, i) => (
          <div key={i} className="p-3.5 rounded-ds border border-gray-200 dark:border-white/10">
            <div className="font-medium">{s.heading}</div>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-grayish">
              {s.bullets.map((b, j) => (
                <li key={j}>
                  <span className="font-medium text-lightText dark:text-white">{b.title}:</span>{' '}
                  <span>{b.body}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Alert variant="info" className="mt-4">
        Use this strategy on every attempt. You can revisit it anytime from the module home page.
      </Alert>
    </Card>
  );
};
