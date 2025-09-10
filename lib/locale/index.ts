// lib/locale/index.ts
// Compatibility bridge for i18n helpers used across the app.

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
    const short = nav.split('-')[0] as Locale;
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
