import { useRouter } from 'next/router';
import SectionTest from '@/components/mock-tests/SectionTest';
import { mockSections } from '@/data/mockTests';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function SectionPage() {
  const router = useRouter();
  const { section } = router.query as { section?: string };
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
    <SectionTest
      section={section}
      duration={duration}
      questions={questions}
    />
  );
}
