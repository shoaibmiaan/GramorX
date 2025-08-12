import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Avoids hydration mismatch

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded hover:bg-purpleVibe/10 transition"
      aria-label="Toggle Theme"
    >
      {currentTheme === 'light' ? (
        <i className="fas fa-moon text-lg text-yellow-400"></i>
      ) : (
        <i className="fas fa-sun text-lg text-yellow-400"></i>
      )}
    </button>
  );
};
