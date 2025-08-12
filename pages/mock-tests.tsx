import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export default function MockTests() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-h2">Mock Tests</h1>
          <p className="text-grayish mt-2">Coming soon — timed full tests with band simulation.</p>
        </Card>
      </Container>
    </section>
  );
}
