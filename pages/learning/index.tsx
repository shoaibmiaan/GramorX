import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';
import { Input } from '@/components/design-system/Input';
import { CourseCatalog } from '@/components/sections/Learning/CourseCatalog';
import { TipsGrid } from '@/components/sections/Learning/TipsGrid';
import { DrillGenerator } from '@/components/sections/Learning/DrillGenerator';

export default function LearningIndex() {
  return (
    <>
      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          <h1 className="font-slab text-h1 md:text-display text-lightText dark:text-white">
            Learning Hub
          </h1>
          <p className="text-grayish max-w-2xl mt-3">
            Structured courses, targeted lessons, strategy tips, and AI drills.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Badge variant="info" className="justify-center">Academic</Badge>
            <Badge variant="info" className="justify-center">General</Badge>
            <Badge variant="success" className="justify-center">Beginner</Badge>
            <Badge variant="warning" className="justify-center">Unlock Paths</Badge>
          </div>
        </Container>
      </section>

      <CourseCatalog />

      <TipsGrid />

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90" id="drills">
        <Container>
          <Card className="card-surface p-6 rounded-ds-2xl">
            <h2 className="font-slab text-h2 mb-2">AI Practice Drills</h2>
            <p className="text-grayish mb-6">Generate targeted exercises based on your goals.</p>
            <DrillGenerator />
          </Card>
        </Container>
      </section>
    </>
  );
}
