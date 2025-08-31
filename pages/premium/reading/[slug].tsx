import * as React from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { ExamShell } from '@/premium-ui/exam/ExamShell';
import { PrButton } from '@/premium-ui/components/PrButton';
import { PinGate } from '@/premium-ui/access/PinGate';

// Basic types for reading tests
export type Question = {
  id: string;
  qNo: number;
  type: 'mcq' | 'tfng' | 'gap';
  prompt: string;
  options?: string[];
  answer?: string;
};

export type Passage = {
  orderNo: number;
  title?: string;
  content: string;
  questions: Question[];
};

export type ReadingTest = {
  slug: string;
  title: string;
  duration_sec: number;
  passages: Passage[];
};

export default function ReadingExam() {
  const router = useRouter();
  const slug = String(router.query.slug || '');

  const [test, setTest] = React.useState<ReadingTest | null>(null);
  const [currentQ, setCurrentQ] = React.useState(1);
  const [passageIdx, setPassageIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [review, setReview] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);

  // fetch test from Supabase
  React.useEffect(() => {
    if (!slug) return;
    supabase
      .from('lm_reading_tests')
      .select('slug,title,passages,duration_sec')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setTest({
            slug: data.slug,
            title: data.title,
            duration_sec: data.duration_sec ?? 60 * 60,
            passages: (data.passages as Passage[]) || [],
          });
        }
      });
  }, [slug]);

  const totalQuestions = React.useMemo(() => {
    if (!test) return 0;
    return test.passages.reduce((sum, p) => sum + p.questions.length, 0);
  }, [test]);

  const handleNavigate = (qNo: number) => {
    setCurrentQ(qNo);
    if (!test) return;
    let count = 0;
    for (let i = 0; i < test.passages.length; i++) {
      const len = test.passages[i].questions.length;
      if (qNo > count && qNo <= count + len) {
        setPassageIdx(i);
        break;
      }
      count += len;
    }
    setTimeout(() => {
      const el = document.querySelector(`[data-q="${qNo}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  const handleAnswer = (id: string, val: string) => {
    setAnswers((a) => ({ ...a, [id]: val }));
  };

  const saveAnswers = async () => {
    if (!test) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const rows = Object.entries(answers)
      .map(([qid, answer]) => {
        const q = test.passages.flatMap((p) => p.questions).find((qq) => qq.id === qid);
        if (!q) return null;
        return {
          user_id: user?.id ?? null,
          test_slug: test.slug,
          q_no: q.qNo,
          answer,
        };
      })
      .filter(Boolean) as {
      user_id: string | null;
      test_slug: string;
      q_no: number;
      answer: string;
    }[];
    if (rows.length) {
      await supabase
        .from('lm_reading_user_answers')
        .upsert(rows, { onConflict: 'user_id,test_slug,q_no' });
    }
  };

  const onSubmit = async () => {
    await saveAnswers();
    setReview(true);
  };

  const currentPassage = test?.passages[passageIdx];

  if (!unlocked) {
    return <PinGate onSuccess={() => setUnlocked(true)} />;
  }

  return (
    <ExamShell
      title={`Reading • ${slug}`}
      totalQuestions={totalQuestions}
      currentQuestion={currentQ}
      onNavigate={handleNavigate}
      seconds={test?.duration_sec}
      onTimeUp={onSubmit}
    >
      {!test ? (
        <p className="pr-text-center">Loading…</p>
      ) : (
        <div className="pr-space-y-4">
          <div className="pr-flex pr-gap-2 pr-flex-wrap">
            {test.passages.map((p, idx) => (
              <PrButton
                key={idx}
                variant={idx === passageIdx ? 'default' : 'outline'}
                onClick={() => setPassageIdx(idx)}
              >
                Passage {idx + 1}
              </PrButton>
            ))}
          </div>

          <div
            className="pr-prose pr-max-w-none pr-bg-[var(--pr-card)] pr-p-4 pr-rounded-xl"
            dangerouslySetInnerHTML={{ __html: currentPassage?.content || '' }}
          />

          <div className="pr-space-y-4">
            {currentPassage?.questions.map((q) => (
              <div key={q.id} data-q={q.qNo} className="pr-space-y-2">
                <p className="pr-font-medium">
                  {q.qNo}. {q.prompt}
                </p>
                {q.type === 'mcq' ? (
                  <div className="pr-flex pr-flex-col pr-gap-2">
                    {q.options?.map((opt) => (
                      <label key={opt} className="pr-flex pr-items-center pr-gap-2">
                        <input
                          type="radio"
                          name={q.id}
                          disabled={review}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'tfng' ? (
                  <div className="pr-flex pr-gap-2">
                    {['True', 'False', 'Not Given'].map((opt) => (
                      <label key={opt} className="pr-flex pr-items-center pr-gap-2">
                        <input
                          type="radio"
                          name={q.id}
                          disabled={review}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    className="pr-w-full pr-rounded-lg pr-border pr-border-[var(--pr-border)] pr-bg-transparent pr-px-2 pr-py-1"
                    disabled={review}
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  />
                )}
                {review && q.answer && (
                  <p className="pr-text-sm pr-opacity-70">Correct: {q.answer}</p>
                )}
              </div>
            ))}
          </div>

          {!review && (
            <div className="pr-flex pr-justify-end">
              <PrButton onClick={onSubmit}>Submit</PrButton>
            </div>
          )}
        </div>
      )}
    </ExamShell>
  );
}
