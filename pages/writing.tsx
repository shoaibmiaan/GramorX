import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function WritingPage() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="text-4xl font-bold text-gradient-primary mb-6">
          IELTS Writing Module
        </h1>
        <p className="text-lg text-grayish mb-10">
          The Writing test measures your ability to express ideas clearly and
          coherently in written English. Practice with AI feedback to refine
          your grammar, vocabulary, and task response.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Task 1: Charts/Processes (Academic) & Letters (GT)',
            'Task 2: Essay planner and idea bank',
            'Band descriptors checklist (TR/CC/LR/GRA)',
            'Sample Band 9 responses for reference',
            'AI feedback on coherence, vocabulary, grammar',
            'Paraphrasing & cohesion suggestions',
          ].map((feature) => (
            <Card key={feature} className="p-6 rounded-xl hover:shadow-glow">
              <p className="text-[#d0d0e0]">✓ {feature}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
