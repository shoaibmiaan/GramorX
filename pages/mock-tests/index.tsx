import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import Link from 'next/link';

export default function MockTests() {
  const sections = ['listening', 'reading', 'writing', 'speaking'];
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <h1 className="font-slab text-h2">Mock Tests</h1>
          <p className="text-grayish mt-2 mb-4">
            Timed full-length tests and section-wise practice with band score simulation.
          </p>
          <ul className="space-y-2">
            <li>
              <Link className="text-primary underline" href="/mock-tests/full">
                Full Test
              </Link>
            </li>
            <li>
              <Link className="text-primary underline" href="/mock-tests/analytics">
                Analytics
              </Link>
            </li>
            {sections.map((s) => (
              <li key={s}>
                <Link className="text-primary underline" href={`/mock-tests/${s}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)} Practice
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </section>
  );
}
