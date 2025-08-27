import { useState, useEffect } from 'react';
import SectionTest, { SectionResult } from '@/components/mock-tests/SectionTest';
import { mockSections } from '@/data/mockTests';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

const order = ['listening', 'reading', 'writing', 'speaking'] as const;

type Progress = {
  current: number;
  results: SectionResult[];
};

export default function FullTestPage() {
  const [progress, setProgress] = useState<Progress>({ current: 0, results: [] });
  const [finished, setFinished] = useState(false);

  // load progress
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('full-test-progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // persist progress
  useEffect(() => {
    if (typeof window === 'undefined' || finished) return;
    localStorage.setItem('full-test-progress', JSON.stringify(progress));
  }, [progress, finished]);

  const handleSectionComplete = (res: SectionResult) => {
    const nextResults = [...progress.results, res];
    const nextIndex = progress.current + 1;
    if (nextIndex < order.length) {
      setProgress({ current: nextIndex, results: nextResults });
    } else {
      // finished
      const overallBand =
        nextResults.reduce((sum, r) => sum + r.band, 0) / nextResults.length;
      const summary = { date: new Date().toISOString(), overallBand, sections: nextResults };
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(
            localStorage.getItem('full-test-results') || '[]'
          );
          existing.push(summary);
          localStorage.setItem('full-test-results', JSON.stringify(existing));
          localStorage.removeItem('full-test-progress');
        } catch {
          // ignore
        }
      }
      setProgress({ current: nextIndex, results: nextResults });
      setFinished(true);
      setFinal(summary);
    }
  };

  const [final, setFinal] = useState<any>(null);

  if (finished && final) {
    return (
      <section className="py-24">
        <Container>
          <Card className="p-6 rounded-ds-2xl">
            <h1 className="font-slab text-h3 mb-4">Full Test Summary</h1>
            <p className="mb-2">Overall band: {final.overallBand.toFixed(1)}</p>
            <ul className="mb-4 list-disc list-inside">
              {final.sections.map((s: SectionResult) => (
                <li key={s.section}>
                  {s.section}: {s.band} (correct {s.correct}/{s.total})
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </section>
    );
  }

  const currentKey = order[progress.current];
  const sectionData = mockSections[currentKey];

  return (
    <SectionTest
      section={currentKey}
      duration={sectionData.duration}
      questions={sectionData.questions}
      onComplete={handleSectionComplete}
    />
  );
}
