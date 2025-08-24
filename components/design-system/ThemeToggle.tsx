import React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? 'light') === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:shadow-sm
                 bg-white/70 dark:bg-white/10 backdrop-blur
                 border-black/10 dark:border-white/15"
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      <span aria-hidden className="text-base">{isDark ? '🌙' : '☀️'}</span>
      <span className="opacity-80">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
