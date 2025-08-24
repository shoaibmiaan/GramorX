import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { PREMIUM_THEMES, type PremiumThemeId } from './premium-themes';

type ThemeCtxValue = {
  theme: PremiumThemeId;
  setTheme: (t: PremiumThemeId) => void;
};

const ThemeCtx = createContext<ThemeCtxValue | null>(null);
const STORAGE_KEY = 'pr-theme';

/** Optional: migrate any old theme ids to the new ones */
function normalizeTheme(raw?: string | null): PremiumThemeId {
  if (!raw) return 'carbon';
  const val = raw.toLowerCase();
  // Legacy aliases
  if (val === 'dark') return 'carbon';
  if (val === 'light') return 'ivory';
  if (val === 'gold') return 'royal';
  if (val === 'aurora') return 'aurora';
  if (['carbon','ivory','royal','aurora'].includes(val)) return val as PremiumThemeId;
  return 'carbon';
}

export function usePremiumTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('usePremiumTheme must be used inside <PremiumThemeProvider>');
  return ctx;
}

type Props = {
  children: ReactNode;
  /** allow Storybook or app shells to specify initial */
  initialTheme?: PremiumThemeId;
};

export function PremiumThemeProvider({ children, initialTheme }: Props) {
  const [theme, setTheme] = useState<PremiumThemeId>(() => normalizeTheme(initialTheme || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : 'carbon')));

  // persist + reflect to DOM
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-pr-theme', theme);
      document.documentElement.classList.add('pr-themed');
    }
  }, [theme]);

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) setTheme(normalizeTheme(e.newValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeCtx.Provider value={value}>
      {/* wrapper can hold bg/surface classes for quick theming */}
      <div className="pr min-h-screen bg-[var(--pr-bg)] text-[var(--pr-fg)]">
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}
