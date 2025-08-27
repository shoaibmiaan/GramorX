import { useState, useEffect } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

export type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number;
};

export type SectionResult = {
  section: string;
  band: number;
  correct: number;
  total: number;
  timeTaken: number;
  tabSwitches: number;
};

type Props = {
  section: string;
  duration: number;
  questions: Question[];
  onComplete?: (result: SectionResult) => void;
};

export function SectionTest({ section, duration, questions, onComplete }: Props) {
  const { seconds, set, running, start, stop, reset } = useCountdown(duration, true);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [result, setResult] = useState<SectionResult | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  // load saved state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`mock-${section}-state`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.answers)) setAnswers(parsed.answers);
        if (typeof parsed.seconds === 'number') set(parsed.seconds);
        if (typeof parsed.tabSwitches === 'number') setTabSwitches(parsed.tabSwitches);
      } catch {
        // ignore
      }
    }
  }, [section, set]);

  // persist state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = { answers, seconds, tabSwitches };
    localStorage.setItem(`mock-${section}-state`, JSON.stringify(state));
  }, [answers, seconds, section, tabSwitches]);

  // tab switch detection
  useEffect(() => {
    const handler = () => {
      if (document.hidden) setTabSwitches((n) => n + 1);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // auto submit when time runs out
  useEffect(() => {
    if (seconds === 0 && result === null) handleSubmit();
  }, [seconds, result]);

  const handleAnswer = (qIndex: number, optIndex: number) => {
    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  };

  const handleSubmit = () => {
    stop();
    const correct = questions.reduce(
      (sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0),
      0
    );
    const bandRaw = (correct / questions.length) * 9;
    const band = Math.round(bandRaw * 2) / 2;
    const res: SectionResult = {
      section,
      band,
      correct,
      total: questions.length,
      timeTaken: duration - seconds,
      tabSwitches,
    };
    setResult(res);
    if (typeof window !== 'undefined') {
      try {
        const existing: SectionResult[] = JSON.parse(
          localStorage.getItem('mock-results') || '[]'
        );
        existing.push(res);
        localStorage.setItem('mock-results', JSON.stringify(existing));
        localStorage.removeItem(`mock-${section}-state`);
      } catch {
        // ignore
      }
    }
    onComplete?.(res);
  };

  if (result) {
    return (
      <section className="py-8">
        <Container>
          <Card className="p-6 rounded-ds-2xl">
            <h2 className="font-slab text-h3 capitalize">{section} Results</h2>
            <p className="mt-4">Band score: {result.band}</p>
            <p>Correct: {result.correct} / {result.total}</p>
            <p>Time taken: {result.timeTaken}s</p>
            <p>Tab switches: {result.tabSwitches}</p>
          </Card>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-8">
      <Container>
        <Card className="p-6 rounded-ds-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-slab text-h3 capitalize">{section} Section</h2>
            <span className="font-mono">{seconds}s</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            {questions.map((q, qi) => (
              <div key={q.id}>
                <p className="mb-2">{q.question}</p>
                <div className="space-y-1">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q${qi}`}
                        checked={answers[qi] === oi}
                        onChange={() => handleAnswer(qi, oi)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Submit Section
            </button>
          </form>
        </Card>
      </Container>
    </section>
  );
}

export default SectionTest;
