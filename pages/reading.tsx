import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function ReadingPage() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="text-4xl font-bold text-gradient-primary mb-6">
          IELTS Reading Module
        </h1>
        <p className="text-lg text-grayish mb-10">
          The Reading test evaluates your ability to understand written
          English, recognize opinions, and extract detailed information. Our
          tools help you improve speed and accuracy with targeted practice.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Academic & General Training passages',
            'All question types (TFNG, Matching, MCQ, Summary)',
            'Skim/scan aids & keyword highlighting',
            'Review flags and section timer',
            'Band score estimator with answer keys',
            'Step-by-step solution walkthroughs',
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
