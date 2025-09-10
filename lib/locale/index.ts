// lib/locale/index.ts
// Compatibility bridge for i18n helpers + a small Locale context.

import React from 'react';
import { loadTranslations as _loadTranslations, getLocale as _getStoredLocale } from '@/lib/i18n';
import type { SupportedLocale as Locale } from '@/lib/i18n/config';

export type { Locale };

/** Detect from storage → <html lang> → navigator, with fallback. */
export function detectLocale(fallback: Locale = 'en'): Locale {
  try {
    const fromStore = _getStoredLocale?.() as Locale | undefined;
    if (fromStore) return fromStore;

    const htmlLang = (typeof document !== 'undefined' && document.documentElement?.lang) as Locale | '';
    if (htmlLang) return htmlLang;

    const nav =
      (typeof navigator !== 'undefined' &&
        (navigator.language || (navigator.languages && navigator.languages[0]))) || '';
    const short = (nav || '').split('-')[0] as Locale;
    return (short || fallback) as Locale;
  } catch {
    return fallback;
  }
}

/** Get current app locale (with provided fallback). */
export function getLocale(fallback: Locale = 'en'): Locale {
  try {
    const v = _getStoredLocale?.() as Locale | undefined;
    return (v || detectLocale(fallback)) as Locale;
  } catch {
    return fallback;
  }
}

/** Persist and reflect locale immediately (storage + <html lang>). */
export function setLocale(next: Locale): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  } catch {
    /* no-op */
  }
}

/** Load translation resources for given locale. */
export async function loadTranslations(next: Locale): Promise<void> {
  await _loadTranslations(next);
}

/* =========================
   Context + Provider + Hook
   ========================= */

type LocaleContextValue = {
  locale: Locale;
  loading: boolean;
  changeLocale: (next: Locale) => Promise<void>;
};

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: 'en',
  loading: false,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  changeLocale: async () => {},
});

/** React hook used across pages/components. */
export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within <LanguageProvider>');
  }
  return ctx;
}

export function LanguageProvider({
  initial,
  children,
}: {
  initial?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocal] = React.useState<Locale>(initial ?? 'en');
  const [loading, setLoading] = React.useState(false);

  // On mount: resolve actual locale safely on client
  React.useEffect(() => {
    const resolved = getLocale(initial ?? 'en');
    setLocal(resolved);
    setLocale(resolved);
  }, [initial]);

  const changeLocale = React.useCallback(async (next: Locale) => {
    setLoading(true);
    try {
      await loadTranslations(next);
      setLocale(next);
      setLocal(next);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: LocaleContextValue = { locale, loading, changeLocale };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
