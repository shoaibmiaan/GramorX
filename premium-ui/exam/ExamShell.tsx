import * as React from 'react';
import { PremiumThemeProvider } from '../theme/PremiumThemeProvider';
import { ThemeSwitcherPremium } from '../theme/ThemeSwitcher';

type Props = {
  children?: React.ReactNode;
  attemptId?: string;
  title?: string;
};

export function ExamShell({ children, attemptId, title = 'Exam Room' }: Props) {
  return (
    <PremiumThemeProvider>
      <header className="pr sticky top-0 z-40 backdrop-blur bg-[color-mix(in oklab,var(--pr-bg),transparent 40%)] border-b border-[var(--pr-border)]">
        <div className="pr container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--pr-card)] border border-[var(--pr-border)] grid place-items-center">🏛️</div>
            <div className="leading-tight">
              <div className="text-sm opacity-70">{attemptId ? `Attempt ${attemptId}` : 'Premium'}</div>
              <h1 className="font-semibold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Placeholder timer pill */}
            <div className="px-3 py-1.5 rounded-xl border border-[var(--pr-border)] bg-[var(--pr-card)] font-mono text-sm">⏱ 59:59</div>
            <ThemeSwitcherPremium />
          </div>
        </div>
      </header>

      <main className="pr container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          {/* Palette placeholder */}
          <aside className="hidden md:block p-3 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-card)]">
            <div className="text-sm opacity-70 mb-2">Questions</div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <button
                  key={i}
                  className="aspect-square rounded-lg border border-[var(--pr-border)] text-sm hover:translate-y-[-1px] transition"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>

          <section className="p-4 rounded-2xl border border-[var(--pr-border)] bg-[var(--pr-surface, var(--pr-card))] min-h-[60vh]">
            {children ?? <p className="opacity-80">Drop your module content here.</p>}
          </section>
        </div>
      </main>
    </PremiumThemeProvider>
  );
}
