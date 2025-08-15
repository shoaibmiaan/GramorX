import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';

export default function TeacherHome() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary">Teacher Portal</h1>
        <p className="text-grayish max-w-2xl mb-10">Review attempts and monitor students.</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold">Writing Reviews</h3>
              <Badge variant="info">T1/T2</Badge>
            </div>
            <p className="text-grayish mb-4">Browse & score essays.</p>
            <Button as="a" href="/teacher/writing" variant="primary">Open</Button>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold">Speaking Reviews</h3>
              <Badge variant="info">Audio</Badge>
            </div>
            <p className="text-grayish mb-4">Listen & give band feedback.</p>
            <Button as="a" href="/teacher/speaking" variant="secondary">Open</Button>
          </Card>
        </div>
      </Container>
    </section>
  );
}
