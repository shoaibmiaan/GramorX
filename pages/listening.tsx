import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function ListeningPage() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="text-4xl font-bold text-gradient-primary mb-6">
          IELTS Listening Module
        </h1>
        <p className="text-lg text-grayish mb-10">
          The Listening test assesses your ability to understand spoken English
          in a variety of contexts, from everyday conversations to academic
          discussions. Our platform provides realistic practice with AI-powered
          evaluation to help you master every section.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            '40-question full tests with authentic audio',
            'Multiple accents (UK, US, Australian)',
            'Highlight & note-taking tools',
            'Instant scoring with answer review',
            'Detailed explanations for each question',
            'Vocabulary extraction from audio',
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
