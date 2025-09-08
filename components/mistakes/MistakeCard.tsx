import React from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export type Mistake = {
  id: string;
  mistake: string;
  correction: string | null;
  type: string;
  next_review: string | null;
  repetitions: number;
};

export type MistakeCardProps = {
  mistake: Mistake;
  onReview: (id: string, repetitions: number) => void;
};

export const MistakeCard: React.FC<MistakeCardProps> = ({ mistake, onReview }) => {
  const next = mistake.next_review
    ? new Date(mistake.next_review).toLocaleDateString()
    : 'today';

  return (
    <Card className="p-4 rounded-ds-2xl">
      <div className="font-medium">{mistake.mistake}</div>
      {mistake.correction && (
        <div className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
          Correct: {mistake.correction}
        </div>
      )}
      <div className="text-xs text-gray-600 dark:text-muted-foreground mt-2">
        Next review: {next}
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="mt-3 rounded-ds"
        onClick={() => onReview(mistake.id, mistake.repetitions)}
      >
        Mark reviewed
      </Button>
    </Card>
  );
};

export default MistakeCard;
