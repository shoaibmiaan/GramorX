import React from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@/lib/icons';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? 'light') === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:shadow-sm
                 bg-card/70 dark:bg-card/10 backdrop-blur
                 border-border dark:border-border/20"
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      {isDark ? (
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="opacity-80">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
