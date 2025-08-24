import * as React from 'react';
import { PREMIUM_THEMES, type PremiumThemeId } from './premium-themes';
import { usePremiumTheme } from './PremiumThemeProvider';

export function ThemeSwitcherPremium() {
  const { theme, setTheme } = usePremiumTheme();

  return (
    <div className="pr inline-flex items-center gap-2 p-1 rounded-2xl bg-[var(--pr-card)] border border-[var(--pr-border)]">
      {PREMIUM_THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          aria-pressed={theme === t.id}
          className={[
            'px-3 py-1.5 rounded-xl text-sm transition duration-150 border',
            theme === t.id
              ? 'bg-[var(--pr-primary)] text-[var(--pr-on-primary)] border-transparent shadow-[var(--pr-shadow-md)]'
              : 'bg-[color-mix(in oklab,var(--pr-card),white 6%)] text-[var(--pr-fg)] border-[var(--pr-border)] hover:bg-[color-mix(in oklab,var(--pr-card),white 12%)]'
          ].join(' ')}
          title={t.note || t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
