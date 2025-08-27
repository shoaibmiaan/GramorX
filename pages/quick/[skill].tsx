import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import QuickDrillButton from '@/components/quick/QuickDrillButton';

export default function QuickSkillPage() {
  const router = useRouter();
  const { skill } = router.query;
  const [exercise, setExercise] = useState<string>('');

  useEffect(() => {
    if (!skill) return;
    const fetchDrill = async () => {
      try {
        const res = await fetch(`/api/quick-drill?skill=${skill}`);
        const data = await res.json();
        setExercise(data.exercise);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDrill();
  }, [skill]);

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-h2 mb-4 capitalize">Quick Drill – {skill}</h1>
          {exercise ? (
            <p className="whitespace-pre-wrap text-body">{exercise}</p>
          ) : (
            <p>Loading...</p>
          )}
          <div className="mt-6">
            <QuickDrillButton />
          </div>
        </Card>
      </Container>
    </section>
  );
}
