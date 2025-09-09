// pages/onboarding/date.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import StepShell from '@/components/onboarding/StepShell';
import { Input } from '@/components/design-system/Input';

const STEPS = [
  { label: 'Target Band', href: '/onboarding/goal', done: true },
  { label: 'Exam Date', href: '/onboarding/date' },
  { label: 'Weak Areas', href: '/onboarding/skills' },
  { label: 'Schedule', href: '/onboarding/schedule' },
];

export default function Page() {
  const router = useRouter();
  const [examDate, setExamDate] = React.useState<string>('');

  // Restore & persist
  React.useEffect(() => {
    const saved = window.localStorage.getItem('onboarding.date');
    if (saved) setExamDate(saved);
  }, []);
  React.useEffect(() => {
    if (examDate) window.localStorage.setItem('onboarding.date', examDate);
  }, [examDate]);

  const back = () => router.push('/onboarding/goal');
  const next = () => router.push('/onboarding/skills');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepShell
        step={2}
        total={4}
        title="Your Exam Date"
        subtitle="We’ll back-calculate a plan that fits your deadline."
        onBack={back}
        onNext={next}
        nextLabel="Continue"
        steps={STEPS}
        hint="If you’re not sure, pick an approximate date — you can update anytime."
      >
        <div className="grid gap-4">
          <Input
            type="date"
            label="IELTS Exam Date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <p className="text-sm text-mutedText">
            Choosing a date helps us pace your mocks and AI-graded tasks.
          </p>
        </div>
      </StepShell>
    </div>
  );
}
