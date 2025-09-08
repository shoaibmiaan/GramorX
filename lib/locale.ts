// lib/locale.ts
// Minimal, pages-router friendly locale helpers used by LocaleSwitcher
// and /settings/language. No external deps.

const STORAGE_KEY = 'gx_locale';

export type SupportedLocale = 'en' | 'ur' | 'ar' | 'hi'; // extend if needed

export function detectLocale(): SupportedLocale {
  // 1) URL ?lang=  2) localStorage  3) <html lang>  4) navigator
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const q = url.searchParams.get('lang');
      if (q) return (q as SupportedLocale);

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) return (stored as SupportedLocale);

      const htmlLang = document.documentElement.getAttribute('lang');
      if (htmlLang) return (htmlLang as SupportedLocale);

      const nav = navigator?.language?.slice(0, 2);
      if (nav) return (nav as SupportedLocale);
    }
  } catch {
    /* no-op */
  }
  return 'en';
}

/** Persist + apply locale (also updates <html lang="...">). */
export function setLocale(next: SupportedLocale) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute('lang', next);
      // Optional: fire a custom event if parts of the app listen for changes
      window.dispatchEvent(new CustomEvent('gx:locale-change', { detail: { locale: next } }));
    }
  } catch {
    /* no-op */
  }
}

// Back-compat alias if someone imports persistLocale:
export const persistLocale = setLocale;
