// pages/speaking/simulator/index.tsx
import Link from 'next/link';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';

export default function SpeakingSimulatorIndex() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="font-slab text-4xl text-gradient-primary">Speaking — Simulator</h1>

          <Link href="/speaking">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>

        <p className="text-grayish max-w-2xl mt-2">
          Practice each IELTS Speaking part with realistic pacing and instant feedback.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-5">
            <h3 className="font-semibold mb-2">Part 1 — Interview</h3>
            <p className="text-sm opacity-80 mb-4">Short questions about you and familiar topics.</p>
            <Link href="/speaking/simulator/part1">
              <Button>Start Part 1</Button>
            </Link>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-2">Part 2 — Cue Card</h3>
            <p className="text-sm opacity-80 mb-4">1-min prep → 3-beep → auto-record 2 min. Stop → Submit/Retry.</p>
            <Link href="/speaking/simulator/part2">
              <Button>Start Part 2</Button>
            </Link>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-2">Part 3 — Discussion</h3>
            <p className="text-sm opacity-80 mb-4">Deeper questions linked to Part 2 topic.</p>
            <Link href="/speaking/simulator/part3">
              <Button>Start Part 3</Button>
            </Link>
          </Card>
        </div>
      </Container>
    </section>
  );
}
