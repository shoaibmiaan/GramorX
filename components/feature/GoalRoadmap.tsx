import React, { useMemo } from 'react';
import { Card } from '@/components/design-system/Card';

export interface GoalRoadmapProps {
  examDate?: string | null;
}

export const GoalRoadmap: React.FC<GoalRoadmapProps> = ({ examDate }) => {
  const plan = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const exam = new Date(examDate);
    if (isNaN(exam.getTime()) || exam <= now) return null;
    const weeks = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const foundation = Math.ceil(weeks * 0.4);
    const practice = Math.ceil(weeks * 0.4);
    const review = weeks - foundation - practice;
    return [
      { label: 'Foundation', weeks: foundation },
      { label: 'Practice', weeks: practice },
      { label: 'Review', weeks: review },
    ];
  }, [examDate]);

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h3 className="font-slab text-h3 mb-2">Study Roadmap</h3>
      {!plan ? (
        <p className="text-body">Set an exam date to generate your timeline.</p>
      ) : (
        <ol className="mt-2 space-y-2 text-body">
          {plan.map((p, i) => (
            <li key={i}>
              <span className="font-semibold">{p.label}:</span> {p.weeks} week{p.weeks !== 1 ? 's' : ''}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
};

export default GoalRoadmap;
