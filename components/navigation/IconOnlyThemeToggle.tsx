'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function IconOnlyThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (theme ?? resolvedTheme) === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        inline-flex h-10 w-10 items-center justify-center rounded-lg
        hover:bg-muted transition
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border
      "
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
