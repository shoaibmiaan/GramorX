import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function SpeakingPage() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="text-4xl font-bold text-gradient-primary mb-6">
          IELTS Speaking Module
        </h1>
        <p className="text-lg text-grayish mb-10">
          The Speaking test evaluates your fluency, coherence, vocabulary, and
          pronunciation. Our AI-powered speaking simulator helps you prepare
          for all three parts with realistic prompts and instant feedback.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Parts 1–3 simulator with live prompts',
            'Cue-card (Part 2) with prep & speech timer',
            'Record, playback, and auto-transcription',
            'Pronunciation, fluency & lexical analytics',
            'Follow-up questions bank',
            'AI feedback with estimated band',
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
