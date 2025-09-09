// pages/onboarding/skills.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import StepShell from '@/components/onboarding/StepShell';
import { Checkbox } from '@/components/design-system/Checkbox';

type Skill = 'listening' | 'reading' | 'writing' | 'speaking';

const SKILLS: { key: Skill; label: string; hint: string }[] = [
  { key: 'listening', label: 'Listening', hint: 'MCQs, maps, conversations' },
  { key: 'reading', label: 'Reading', hint: 'True/False/NG, headings' },
  { key: 'writing', label: 'Writing', hint: 'Task 1 visuals, Task 2 essays' },
  { key: 'speaking', label: 'Speaking', hint: 'Part 2 cue card, follow-ups' },
];

const STEPS = [
  { label: 'Target Band', href: '/onboarding/goal', done: true },
  { label: 'Exam Date', href: '/onboarding/date', done: true },
  { label: 'Weak Areas', href: '/onboarding/skills' },
  { label: 'Schedule', href: '/onboarding/schedule' },
];

export default function Page() {
  const router = useRouter();
  const [weak, setWeak] = React.useState<Record<Skill, boolean>>({
    listening: false, reading: false, writing: false, speaking: false,
  });

  // Restore & persist
  React.useEffect(() => {
    const saved = window.localStorage.getItem('onboarding.weak');
    if (saved) {
      try { setWeak(JSON.parse(saved)); } catch {}
    }
  }, []);
  React.useEffect(() => {
    window.localStorage.setItem('onboarding.weak', JSON.stringify(weak));
  }, [weak]);

  const back = () => router.push('/onboarding/date');
  const next = () => router.push('/onboarding/schedule');
  const toggle = (k: Skill) => setWeak((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StepShell
        step={3}
        total={4}
        title="Pick Your Weak Areas"
        subtitle="We’ll bias practice & AI feedback toward these."
        onBack={back}
        onNext={next}
        nextLabel="Continue"
        steps={STEPS}
        hint="Not sure? Leave all unchecked — we’ll detect weaknesses via a quick diagnostic."
      >
        <div className="grid gap-4">
          {SKILLS.map(({ key, label, hint }) => (
            <label key={key} className="flex items-start gap-3 rounded-ds-xl border border-border p-3 hover:bg-card/60">
              <Checkbox checked={weak[key]} onCheckedChange={() => toggle(key)} />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-mutedText">{hint}</div>
              </div>
            </label>
          ))}
          <p className="text-sm text-mutedText">
            You can refine this after your first mock — AI will surface patterns.
          </p>
        </div>
      </StepShell>
    </div>
  );
}
