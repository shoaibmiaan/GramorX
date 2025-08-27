import React, { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Input } from '@/components/design-system/Input';
import { Textarea } from '@/components/design-system/Textarea';
import { Select } from '@/components/design-system/Select';
import { Button } from '@/components/design-system/Button';
import MistakeCard, { Mistake } from '@/components/mistakes/MistakeCard';
import { scheduleReview } from '@/lib/spacedRepetition';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ mistake: '', correction: '', type: 'grammar' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/mistakes');
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setMistakes(data as Mistake[]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mistake) return;
    const res = await fetch('/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setMistakes((m) => [data as Mistake, ...m]);
      setForm({ mistake: '', correction: '', type: 'grammar' });
    }
  };

  const handleReview = async (id: string, reps: number) => {
    const next = scheduleReview(reps + 1).toISOString();
    const res = await fetch('/api/mistakes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, repetitions: reps + 1, next_review: next }),
    });
    if (res.ok) {
      setMistakes((arr) =>
        arr.map((m) => (m.id === id ? { ...m, repetitions: reps + 1, next_review: next } : m)),
      );
    }
  };

  return (
    <Container className="py-10">
      <h1 className="font-slab text-h2 mb-6">Mistakes Book</h1>
      <form onSubmit={submit} className="grid gap-4 mb-8 max-w-xl">
        <Input
          label="Mistake"
          value={form.mistake}
          onChange={(e) => setForm({ ...form, mistake: e.target.value })}
          required
        />
        <Textarea
          label="Correction"
          value={form.correction}
          onChange={(e) => setForm({ ...form, correction: e.target.value })}
        />
        <div className="flex gap-2 items-end">
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'grammar', label: 'Grammar' },
              { value: 'vocab', label: 'Vocabulary' },
            ]}
            className="flex-1"
          />
          <Button type="submit" className="rounded-ds self-end">
            Add
          </Button>
        </div>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {mistakes.map((m) => (
            <MistakeCard key={m.id} mistake={m} onReview={handleReview} />
          ))}
        </div>
      )}
    </Container>
  );
}
