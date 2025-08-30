import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/design-system/Card';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

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

export type SectionTestHandle = {
  submit: () => void;
};

type Props = {
  section: string;
  questions: Question[];
  onComplete?: (result: SectionResult) => void;
};

export const SectionTest = forwardRef<SectionTestHandle, Props>(
  function SectionTest({ section, questions, onComplete }, ref) {
    const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
    const [result, setResult] = useState<SectionResult | null>(null);
    const [tabSwitches, setTabSwitches] = useState(0);
    const startRef = useRef(Date.now());

    useImperativeHandle(ref, () => ({ submit: handleSubmit }));

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const saved = localStorage.getItem(`mock-${section}-state`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.answers)) setAnswers(parsed.answers);
          if (typeof parsed.tabSwitches === 'number') setTabSwitches(parsed.tabSwitches);
        } catch {
          // ignore
        }
      }
    }, [section]);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const state = { answers, tabSwitches };
      localStorage.setItem(`mock-${section}-state`, JSON.stringify(state));
    }, [answers, section, tabSwitches]);

    useEffect(() => {
      const handler = () => {
        if (document.hidden) setTabSwitches((n) => n + 1);
      };
      document.addEventListener('visibilitychange', handler);
      return () => document.removeEventListener('visibilitychange', handler);
    }, []);

    function handleAnswer(qIndex: number, optIndex: number) {
      const next = [...answers];
      next[qIndex] = optIndex;
      setAnswers(next);
    }

    async function handleSubmit() {
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
        timeTaken: Math.round((Date.now() - startRef.current) / 1000),
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
      try {
        const {
          data: { session },
        } = await supabaseBrowser.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          await supabaseBrowser.from('mock_test_results').insert({
            user_id: userId,
            section: res.section,
            band: res.band,
            correct: res.correct,
            total: res.total,
            time_taken: res.timeTaken,
            tab_switches: res.tabSwitches,
            created_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Failed to save mock test result', e);
      }
      onComplete?.(res);
    }

    if (result) {
      return (
        <Card className="p-6 rounded-ds-2xl">
          <h2 className="font-slab text-h3 capitalize">{section} Results</h2>
          <p className="mt-4">Band score: {result.band}</p>
          <p>Correct: {result.correct} / {result.total}</p>
          <p>Time taken: {result.timeTaken}s</p>
          <p>Tab switches: {result.tabSwitches}</p>
        </Card>
      );
    }

    return (
      <Card className="p-6 rounded-ds-2xl">
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
    );
  }
);

export default SectionTest;

