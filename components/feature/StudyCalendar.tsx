import React, { useMemo } from 'react';
import { Card } from '@/components/design-system/Card';
import { useStreak } from '@/hooks/useStreak';
import { getDayKeyInTZ } from '@/lib/streak';

export const StudyCalendar: React.FC = () => {
  const { current, lastDayKey, loading, nextRestart } = useStreak();

  const days = useMemo(() => {
    const arr: { key: string; date: Date; completed: boolean }[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = getDayKeyInTZ(d);
      let completed = false;
      if (lastDayKey) {
        const last = new Date(lastDayKey);
        const diff = Math.floor((last.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < current) completed = true;
      }
      arr.push({ key, date: d, completed });
    }
    return arr;
  }, [current, lastDayKey]);

  if (loading) {
    return null;
  }

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h3 className="font-slab text-h3 mb-4">Study Calendar</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {days.map((day) => (
          <div
            key={day.key}
            className={[
              'h-8 flex items-center justify-center rounded',
              day.completed
                ? 'bg-electricBlue text-white'
                : 'bg-muted text-muted-foreground dark:bg-white/10',
            ].join(' ')}
            title={day.key}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>
      {nextRestart && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Restart scheduled on {nextRestart}
        </div>
      )}
    </Card>
  );
};

export default StudyCalendar;
