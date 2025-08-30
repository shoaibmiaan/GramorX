import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('7.0');
  const [examDate, setExamDate] = useState('');
  const [saving, setSaving] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  async function finish() {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          goal_band: Number(goal),
          exam_date: examDate || null,
        });
        await supabase.auth.updateUser({
          data: { onboarding_complete: true },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      router.replace('/dashboard');
    }
  }

  const modules = [
    { name: 'Listening', desc: 'Interactive audio exercises.' },
    { name: 'Reading', desc: 'Articles with comprehension questions.' },
    { name: 'Writing', desc: 'AI feedback on tasks 1 and 2.' },
    { name: 'Speaking', desc: 'Practice conversations with AI.' },
  ];

  return (
    <section className="py-24 bg-lightBg dark:bg-dark/80 min-h-screen">
      <Container className="max-w-lg">
        <Card className="p-8 rounded-ds-2xl">
          {step === 0 && (
            <div className="grid gap-6">
              <h1 className="font-slab text-h2 text-gradient-primary">Your Goal Band</h1>
              <Input
                type="number"
                step="0.5"
                min="5"
                max="9"
                label="Target Band"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button onClick={next} className="rounded-ds-xl">
                  Next
                </Button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-6">
              <h1 className="font-slab text-h2 text-gradient-primary">Your Exam Date</h1>
              <Input
                type="date"
                label="Exam Date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prev} className="rounded-ds-xl">
                  Back
                </Button>
                <Button onClick={next} className="rounded-ds-xl">
                  Next
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-6">
              <h1 className="font-slab text-h2 text-gradient-primary">Explore Modules</h1>
              <ul className="space-y-4">
                {modules.map((m) => (
                  <li key={m.name} className="border-b pb-2">
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-small text-mutedText">{m.desc}</div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prev} className="rounded-ds-xl">
                  Back
                </Button>
                <Button onClick={finish} disabled={saving} className="rounded-ds-xl">
                  {saving ? 'Saving...' : 'Get Started'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </section>
  );
}
