"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/design-system/Card';
import { useStreak } from '@/hooks/useStreak';
import { getDayKeyInTZ } from '@/lib/streak';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { getHoliday } from '@/data/holidays';

type TravelEvent = { start: Date; end: Date; type: string };
type StudyTask = { id: number; title: string; scheduled_date: string; catch_up: boolean };

export const StudyCalendar: React.FC = () => {
  // Merge: keep nextRestart from main + events from codex branch
  const { current, lastDayKey, loading, nextRestart } = useStreak();
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [dragTask, setDragTask] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: tpData, error: tpErr } = await supabase
        .from('travel_plans')
        .select('start_date,end_date,type')
        .eq('user_id', session.user.id);

      if (!tpErr && tpData) {
        setEvents(
          tpData.map((p: any) => ({
            start: new Date(p.start_date),
            end: new Date(p.end_date),
            type: p.type,
          }))
        );
      }

      const { data: taskData, error: taskErr } = await supabase
        .from('study_tasks')
        .select('id,title,scheduled_date,catch_up')
        .eq('user_id', session.user.id);

      if (!taskErr && taskData) {
        setTasks(taskData as StudyTask[]);
      }
    })();
  }, []);

  const days = useMemo(() => {
    const arr: { key: string; date: Date; completed: boolean; event?: string; tasks?: StudyTask[] }[] = [];
    const taskMap = tasks.reduce((acc: Record<string, StudyTask[]>, t) => {
      const key = t.scheduled_date;
      acc[key] = acc[key] || [];
      acc[key].push(t);
      return acc;
    }, {});
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = getDayKeyInTZ(d);

      // complete = within current streak window
      let completed = false;
      if (lastDayKey) {
        const last = new Date(lastDayKey as any);
        const diff = Math.floor((last.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < (current || 0)) completed = true;
      }

      // holiday or travel/festival/exam events
      let event: string | undefined;
      const holiday = getHoliday(d);
      if (holiday) {
        event = holiday.name;
      } else {
        const ev = events.find(e => d >= e.start && d <= e.end);
        if (ev) event = ev.type;
      }

      arr.push({ key, date: d, completed, event, tasks: taskMap[key] });
    }
    return arr;
  }, [current, lastDayKey, events, tasks]);

  const handleDrop = async (dayKey: string) => {
    if (dragTask == null) return;
    const { error } = await supabase
      .from('study_tasks')
      .update({ scheduled_date: dayKey })
      .eq('id', dragTask);
    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === dragTask ? { ...t, scheduled_date: dayKey } : t))
      );
    }
    setDragTask(null);
  };

  const toggleCatchUp = async (task: StudyTask) => {
    const { error } = await supabase
      .from('study_tasks')
      .update({ catch_up: !task.catch_up })
      .eq('id', task.id);
    if (!error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, catch_up: !task.catch_up } : t
        )
      );
    }
  };

  const exportICS = () => {
    const events = tasks
      .map((t) => {
        const date = t.scheduled_date.replace(/-/g, '');
        return `BEGIN:VEVENT\nSUMMARY:${t.title}\nDTSTART;VALUE=DATE:${date}\nDTEND;VALUE=DATE:${date}\nEND:VEVENT`;
      })
      .join('\n');
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\n${events}\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'study_tasks.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportGoogle = () => {
    exportICS();
    window.open('https://calendar.google.com/calendar/u/0/r');
  };

  if (loading) return null;

  return (
    <Card className="p-6 rounded-ds-2xl">
      <h3 className="font-slab text-h3 mb-4">Study Calendar</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {days.map((day) => (
          <div
            key={day.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(day.key)}
            className={[
              'min-h-16 p-1 rounded border flex flex-col items-center',
              day.completed
                ? 'bg-electricBlue text-white'
                : 'bg-muted text-muted-foreground dark:bg-white/10',
              day.event ? 'opacity-50' : '',
            ].join(' ')}
            title={day.event ? `${day.key} • ${day.event}` : day.key}
          >
            <div className="font-bold">{day.date.getDate()}</div>
            {day.tasks?.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDragTask(task.id)}
                onClick={() => toggleCatchUp(task)}
                className={`mt-1 w-full rounded px-1 text-[10px] cursor-pointer ${
                  task.catch_up ? 'bg-yellow-300 text-black' : 'bg-white text-black'
                }`}
              >
                {task.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={exportICS}
            className="px-3 py-1 text-xs rounded bg-electricBlue text-white"
          >
            Export iCal
          </button>
          <button
            onClick={exportGoogle}
            className="px-3 py-1 text-xs rounded bg-electricBlue text-white"
          >
            Export Google
          </button>
        </div>
      )}

      {nextRestart && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Restart scheduled on {nextRestart}
        </div>
      )}
    </Card>
  );
};

export default StudyCalendar;
