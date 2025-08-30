import { useRouter } from 'next/router';
import { useRef } from 'react';
import SectionTest, { SectionTestHandle } from '@/components/mock-tests/SectionTest';
import { mockSections } from '@/data/mockTests';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import ExamLayout from '@/components/layouts/ExamLayout';

export default function SectionPage() {
  const router = useRouter();
  const { section } = router.query as { section?: string };
  const testRef = useRef<SectionTestHandle>(null);
  if (!section || !mockSections[section]) {
    return (
      <section className="py-24">
        <Container>
          <Card className="p-6 rounded-ds-2xl">
            <p>Section not found.</p>
          </Card>
        </Container>
      </section>
    );
  }
  const { duration, questions } = mockSections[section];
  return (
    <ExamLayout
      exam="mock-test"
      slug={section}
      title={`${section.charAt(0).toUpperCase() + section.slice(1)} Section`}
      seconds={duration}
      onElapsed={() => testRef.current?.submit()}
    >
      <SectionTest ref={testRef} section={section} questions={questions} />
    </ExamLayout>
  );
}
