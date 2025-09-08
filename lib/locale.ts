// lib/locale.ts
// Minimal, safe helpers for Pages Router. SSR-safe (checks window existence).

const STORAGE_KEY = 'gx_locale';
export type SupportedLocale = 'en' | 'ur' | 'ar' | 'hi';

export function detectLocale(): SupportedLocale {
  try {
    if (typeof window !== 'undefined') {
      // 1) URL ?lang=
      const q = new URL(window.location.href).searchParams.get('lang');
      if (q) return q as SupportedLocale;

      // 2) localStorage
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return stored as SupportedLocale;

      // 3) <html lang>
      const htmlLang = document.documentElement.getAttribute('lang');
      if (htmlLang) return htmlLang as SupportedLocale;

      // 4) navigator
      const nav = navigator?.language?.slice(0, 2);
      if (nav) return nav as SupportedLocale;
    }
  } catch {/* no-op */}
  return 'en';
}

/** Persist + apply locale (also updates <html lang="...">). */
export function setLocale(next: SupportedLocale) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('lang', next);
      window.dispatchEvent(new CustomEvent('gx:locale-change', { detail: { locale: next } }));
    }
  } catch {/* no-op */}
}

// Back-compat: some code imports persistLocale
export const persistLocale = setLocale;
