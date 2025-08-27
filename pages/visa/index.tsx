import React from 'react';

import { Container } from '@/components/design-system/Container';
import TargetScoreForm from '@/components/visa/TargetScoreForm';
import GapToGoal from '@/components/visa/GapToGoal';

export default function VisaPage() {
  return (
    <section className="py-10">
      <Container>
        <h1 className="font-slab text-h1 mb-6">Visa Targets</h1>
        <GapToGoal />
        <div className="mt-8">
          <TargetScoreForm />
        </div>
      </Container>
    </section>
  );
}
