// pages/onboarding/schedule.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import StepShell from '@/components/onboarding/StepShell';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';

const STEPS = [
  { label: 'Target Band', href: '/onboarding/goal', done: true },
  { label: 'Exam Date', href: '/onboarding/date', done: true },
  { label: 'Weak Areas', href: '/onboarding/skills', done: true },
  { label: 'Schedule', href: '/onboarding/schedule' },
];

export default function Page() {
  const router = useRouter();
  const [hoursPerDay, setHoursPerDay] = React.useState<string>('1');
  const [daysPerWeek, setDaysPerWeek] = React.useState<string>('5');

  // Restore & persist
  React.useEffect(() => {
    const h = window.localStorage.getItem('onboarding.hoursPerDay');
    const d = window.localStorage.getItem('onboarding.daysPerWeek');
    if (h) setHoursPerDay(h);
    if (d) setDaysPerWeek(d);
  }, []);
  React.useEffect(() => {
    window.localStorage.setItem('onboarding.hoursPerDay', hoursPerDay);
  }, [hoursPerDay]);
  React.useEffect(() => {
    window.localStorage.setItem('onboarding.daysPerWeek', daysPerWeek);
  }, [daysPerWeek]);

  const back = () => router.push('/onboarding/skills');
  const finish = () => {
    // Optional: send to API later; for now just route
    router.replace('/dashboard');
  };

  const quickHours = ['0.5', '1', '1.5', '2'];
  const quickDays = ['3', '4', '5', '6', '7'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepShell
        step={4}
        total={4}
        title="Study Schedule"
        subtitle="We’ll generate a 4-week plan around your time budget."
        onBack={back}
        onNext={finish}
        nextLabel="Finish"
        steps={STEPS}
        hint="Weekends are great for full mocks; weekdays for targeted drills."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              type="number"
              min="0.5"
              step="0.5"
              label="Hours per day"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {quickHours.map((q) => (
                <Button key={q} type="button" variant="ghost" className="rounded-ds-xl" onClick={() => setHoursPerDay(q)}>
                  {q}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              max="7"
              step="1"
              label="Days per week"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {quickDays.map((q) => (
                <Button key={q} type="button" variant="ghost" className="rounded-ds-xl" onClick={() => setDaysPerWeek(q)}>
                  {q}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-ds-xl border border-border p-3 text-sm text-mutedText">
            We’ll prioritize your weak areas, add mocks on weekends, and include AI-evaluated
            Writing & Speaking frequently.
          </div>

          <div className="flex justify-end">
            <Button variant="link" onClick={() => router.push('/pricing')}>
              Want coach reviews? See plans →
            </Button>
          </div>
        </div>
      </StepShell>
    </div>
  );
}
