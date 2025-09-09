// pages/onboarding/index.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import StepShell from '@/components/onboarding/StepShell';
import { Card } from '@/components/design-system/Card';

const STEPS = [
  { label: 'Target Band', href: '/onboarding/goal' },
  { label: 'Exam Date', href: '/onboarding/date' },
  { label: 'Weak Areas', href: '/onboarding/skills' },
  { label: 'Schedule', href: '/onboarding/schedule' },
];

export default function Onboarding() {
  const router = useRouter();
  const next = () => router.push('/onboarding/goal');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepShell
        step={1}
        total={4}
        title="Let’s set up your IELTS plan"
        subtitle="Four quick steps — goal, date, skills, schedule — then you’re good to go."
        onNext={next}
        nextLabel="Start"
        steps={STEPS}
        hint="Pro tip: Keep a 0.5 band buffer above your target for safety."
      >
        <div className="grid gap-3">
          {STEPS.map((s, i) => (
            <Card key={s.label} className="p-3 rounded-ds-xl border border-border">
              <div className="text-sm">Step {i + 1}</div>
              <div className="font-medium">{s.label}</div>
            </Card>
          ))}
          <p className="text-sm text-mutedText">You can update all of these later from your dashboard.</p>
        </div>
      </StepShell>
    </div>
  );
}
