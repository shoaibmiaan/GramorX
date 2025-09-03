'use client';

import { useTheme } from 'next-themes';

export function IconOnlyThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme ?? resolvedTheme) === 'dark';
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M6.76 4.84 5.34 3.42 3.92 4.84 5.34 6.26 6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v-2h-3v2h3zm-2.76 7.16 1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42zM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm7-1.58 1.42-1.42L19 0.58l-1.42 1.42L19 3.42zM4.84 17.24 3.42 18.66l1.42 1.42 1.42-1.42-1.42-1.42z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
