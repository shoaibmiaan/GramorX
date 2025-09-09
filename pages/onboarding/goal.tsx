// pages/onboarding/goal.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import StepShell from '@/components/onboarding/StepShell';
import { Input } from '@/components/design-system/Input';
import { Button } from '@/components/design-system/Button';

const STEPS = [
  { label: 'Target Band', href: '/onboarding/goal' },
  { label: 'Exam Date', href: '/onboarding/date' },
  { label: 'Weak Areas', href: '/onboarding/skills' },
  { label: 'Schedule', href: '/onboarding/schedule' },
];

export default function Page() {
  const router = useRouter();
  const [goal, setGoal] = React.useState<string>('7.0');

  // Restore & persist
  React.useEffect(() => {
    const saved = window.localStorage.getItem('onboarding.goal');
    if (saved) setGoal(saved);
  }, []);
  React.useEffect(() => {
    window.localStorage.setItem('onboarding.goal', goal);
  }, [goal]);

  const next = () => router.push('/onboarding/date');

  const quick = ['6.5', '7.0', '7.5', '8.0'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepShell
        step={1}
        total={4}
        title="Your Target Band"
        subtitle="Pick the overall band you’re aiming for. You can adjust later."
        onNext={next}
        nextLabel="Continue"
        steps={STEPS}
        hint="Aim 0.5 higher than required — this helps counter exam-day variability."
      >
        <div className="grid gap-4">
          <Input
            type="number"
            step="0.5"
            min="5"
            max="9"
            label="Target Band"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <Button key={q} type="button" variant="ghost" className="rounded-ds-xl" onClick={() => setGoal(q)}>
                {q}
              </Button>
            ))}
          </div>
          <p className="text-sm text-mutedText">
            Many universities accept 6.5–7.0. Choose slightly higher to keep buffer.
          </p>
        </div>
      </StepShell>
    </div>
  );
}
