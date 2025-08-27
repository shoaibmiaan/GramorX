// components/layouts/ExamLayout.tsx
import React from 'react';
import { Container } from '@/components/design-system/Container';
import FocusGuard from '@/components/exam/FocusGuard';
import { DistractionFreeBanner } from '@/premium-ui/exam/DistractionFree';
import { PrTimer } from '@/premium-ui/components/PrTimer';

export type ExamLayoutProps = {
  /** Type of exam, used for focus tracking */
  exam: string;
  /** Optional slug identifying the test */
  slug?: string;
  /** Attempt identifier shown in header */
  attemptId?: string;
  /** Title displayed in header */
  title?: string;
  /** Total seconds for timer */
  seconds: number;
  /** Called when timer reaches zero */
  onElapsed?: () => void;
  /** Optional part navigator element shown in header */
  partNavigator?: React.ReactNode;
  /** Question palette sidebar */
  questionPalette?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
};

export default function ExamLayout({
  exam,
  slug,
  attemptId,
  title = 'Exam Room',
  seconds,
  onElapsed,
  partNavigator,
  questionPalette,
  children,
}: ExamLayoutProps) {
  return (
    <>
      <DistractionFreeBanner />
      <FocusGuard exam={exam} slug={slug} />
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-lightBg dark:bg-dark">
          <Container className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-4">
              <div className="leading-tight">
                {attemptId && (
                  <div className="text-small text-grayish dark:text-gray-400">Attempt {attemptId}</div>
                )}
                <h1 className="font-semibold">{title}</h1>
              </div>
              {partNavigator}
            </div>
            <PrTimer seconds={seconds} onElapsed={onElapsed} />
          </Container>
        </header>

        <main className="flex-1">
          <Container className="py-6 flex gap-4">
            {questionPalette && (
              <aside className="hidden md:block w-60 shrink-0">{questionPalette}</aside>
            )}
            <section className="flex-1">{children}</section>
          </Container>
        </main>
      </div>
    </>
  );
}

