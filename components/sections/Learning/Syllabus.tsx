import React from 'react';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { isUnlocked } from '@/utils/unlock';

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  requiredProgress: number; // unlock threshold in %
};

type Props = {
  lessons: Lesson[];
  userProgress: number;
  courseSlug: string; // NEW: needed for slug-based lesson route
};

export const Syllabus: React.FC<Props> = ({ lessons, userProgress, courseSlug }) => {
  if (!lessons?.length) {
    return (
      <Card className="card-surface p-6 rounded-ds-2xl">
        <div className="text-grayish">No lessons yet.</div>
      </Card>
    );
  }

  return (
    <ol className="grid gap-4">
      {lessons.map((l, idx) => {
        const unlocked = isUnlocked(userProgress, l.requiredProgress);
        const href = unlocked ? `/learning/${courseSlug}/lesson/${l.id}` : '#';

        return (
          <li key={l.id} id={`lesson-${l.id}`}>
            <Card className="card-surface p-5 rounded-ds flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <Badge variant={unlocked ? 'success' : 'warning'} size="sm">
                    {unlocked ? 'Unlocked' : `Locked • ${l.requiredProgress}%`}
                  </Badge>
                  <span className="text-small opacity-70">Lesson {idx + 1}</span>
                </div>
                <h3 className="text-h3 mt-1 truncate">{l.title}</h3>
                <div className="text-small opacity-80 mt-0.5">{l.minutes} min</div>
              </div>

              <Button
                as="a"
                href={href}
                aria-disabled={!unlocked}
                onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                variant={unlocked ? 'primary' : 'secondary'}
                className="rounded-ds-xl"
              >
                {unlocked ? 'Start' : 'Locked'}
              </Button>
            </Card>
          </li>
        );
      })}
    </ol>
  );
};
