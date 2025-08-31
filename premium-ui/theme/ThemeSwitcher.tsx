import * as React from 'react';
import { PREMIUM_THEMES } from './premium-themes';
import { usePremiumTheme } from './PremiumThemeProvider';

export function ThemeSwitcherPremium() {
  const { theme, setTheme } = usePremiumTheme();

  return (
    <div className="pr grid grid-cols-2 gap-2 p-2 rounded-2xl bg-[var(--pr-card)] border border-[var(--pr-border)]">
      {PREMIUM_THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          aria-pressed={theme === t.id}
          className={[
            'aspect-square flex flex-col items-center justify-center gap-2 rounded-xl text-xs transition',
            theme === t.id
              ? 'ring-2 ring-[var(--pr-primary)] ring-offset-2 ring-offset-[var(--pr-card)]'
              : 'border border-[var(--pr-border)] hover:bg-[color-mix(in oklab,var(--pr-card),white 12%)]'
          ].join(' ')}
          title={t.label}
        >
          <span
            className="w-8 h-8 rounded-md"
            style={{ background: t.preview, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

