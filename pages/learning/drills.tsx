// pages/learning/drills.tsx
import React from 'react';
import { Container } from '@/components/design-system/Container';
import { DrillRunner } from '@/components/learning/DrillRunner';

export default function DrillsPage() {
  return (
    <main className="py-8">
      <Container>
        <h1 className="text-2xl font-semibold mb-4">Daily Drill</h1>
        <DrillRunner />
      </Container>
    </main>
  );
}
