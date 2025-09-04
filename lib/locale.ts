// lib/locale.ts
import * as React from 'react';
import { SupportedLocale, defaultLocale } from '@/lib/i18n/config';

const LOCALE_KEY = 'gramorx_locale';

/** Detect preferred locale from localStorage or browser. */
export function detectLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCALE_KEY) as SupportedLocale | null;
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0] as SupportedLocale | undefined;
    if (browserLang && ['en', 'ur'].includes(browserLang)) return browserLang;
  }
  return defaultLocale;
}

/** Persist locale to localStorage. */
export function setLocale(locale: SupportedLocale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_KEY, locale);
    // cookie (optional, helps SSR/edge later)
    document.cookie = `${LOCALE_KEY}=${locale};path=/;max-age=31536000`;
  }
}

// ---- Minimal i18n context so components can call useLocale().t() ----
type LocaleCtx = {
  locale: SupportedLocale;
  t: (key: string) => string; // identity for now
  set: (loc: SupportedLocale) => void;
};

const LocaleContext = React.createContext<LocaleCtx>({
  locale: defaultLocale,
  t: (k) => k,
  set: () => {},
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, set] = React.useState<SupportedLocale>(defaultLocale);

  React.useEffect(() => {
    set(detectLocale());
  }, []);

  const value = React.useMemo<LocaleCtx>(() => ({ locale, t: (k) => k, set }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export function useLocale() {
  return React.useContext(LocaleContext);
}

// 👉 Some files import setLocale under another name
export const persistLocale = setLocale;
