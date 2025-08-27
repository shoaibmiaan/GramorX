import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { useStreak } from '@/hooks/useStreak';
import { getDayKeyInTZ } from '@/lib/streak';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { getHoliday } from '@/data/holidays';

export const StudyCalendar: React.FC = () => {
  const { current, lastDayKey, loading } = useStreak();
  const [events, setEvents] = useState<{ start: Date; end: Date; type: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('travel_plans')
        .select('start_date,end_date,type')
        .eq('user_id', session.user.id);
      if (data) {
        setEvents(
          data.map((p: any) => ({
            start: new Date(p.start_date),
            end: new Date(p.end_date),
            type: p.type,
          }))
        );
      }
    })();
  }, []);

  const days = useMemo(() => {
    const arr: { key: string; date: Date; completed: boolean; event?: string }[] = [];
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
      let event: string | undefined;
      const holiday = getHoliday(d);
      if (holiday) event = holiday.name;
      else {
        const ev = events.find(e => d >= e.start && d <= e.end);
        if (ev) event = ev.type;
      }
      arr.push({ key, date: d, completed, event });
    }
    return arr;
  }, [current, lastDayKey, events]);

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
              day.event ? 'opacity-50' : '',
            ].join(' ')}
            title={day.event ? `${day.key} • ${day.event}` : day.key}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudyCalendar;
