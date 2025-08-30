import * as React from 'react';
import { useRouter } from 'next/router';
import { ExamShell } from '@/premium-ui/exam/ExamShell';
import { PrAudioPlayer } from '@/premium-ui/components/PrAudioPlayer';
import { PrButton } from '@/premium-ui/components/PrButton';
import { requirePremium } from '@/lib/requirePremium';

export default function ListeningExam() {
  const router = useRouter();
  const slug = String(router.query.slug || 'sample-test');

  const [part, setPart] = React.useState(1);
  const total = 4;

  const onNext = () => setPart(p => Math.min(total, p + 1));
  const onPrev = () => setPart(p => Math.max(1, p - 1));

  const answerSheet = (
    <div className="pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-p-4 pr-bg-[var(--pr-card)]">
      <h3 className="pr-font-semibold">Answer Sheet</h3>
      <div className="pr-grid pr-grid-cols-5 pr-gap-2 pr-mt-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <input
            key={i}
            className="pr-w-12 pr-h-10 pr-bg-transparent pr-border pr-border-[var(--pr-border)] pr-rounded-lg pr-text-center focus:pr-border-[var(--pr-primary)]"
          />
        ))}
      </div>
    </div>
  );

  return (
    <ExamShell
      title={`Listening • ${slug}`}
      totalQuestions={total}
      currentQuestion={part}
      seconds={60 * 10}
      onNavigate={setPart}
      onTimeUp={() => alert('Time up!')}
      answerSheet={answerSheet}
    >
      <div className="pr-space-y-4">
        <PrAudioPlayer src="/audio/sample-listening.mp3" />
        <div className="pr-rounded-xl pr-border pr-border-[var(--pr-border)] pr-p-4 pr-bg-[var(--pr-card)]">
          <h3 className="pr-font-semibold">Questions (Part {part})</h3>
          <ol className="pr-list-decimal pr-ml-6 pr-mt-2 pr-space-y-2">
            <li>Sample MCQ…</li>
            <li>Sample Gap Fill…</li>
            <li>Sample Matching…</li>
          </ol>
        </div>
        <div className="pr-flex pr-justify-between">
          <PrButton variant="outline" onClick={onPrev} disabled={part === 1}>
            Back
          </PrButton>
          <PrButton onClick={onNext} disabled={part === total}>
            Next
          </PrButton>
        </div>
      </div>
    </ExamShell>
  );
}

export { requirePremium as getServerSideProps };

