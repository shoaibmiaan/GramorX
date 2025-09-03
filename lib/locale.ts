// lib/locale.ts
import { SupportedLocale, defaultLocale } from "@/lib/i18n/config";

const LOCALE_KEY = "gramorx_locale";

/**
 * Detect preferred locale from localStorage or browser.
 */
export function detectLocale(): SupportedLocale {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LOCALE_KEY) as SupportedLocale | null;
    if (saved) return saved;

    const browserLang =
      navigator.language.split("-")[0] as SupportedLocale | undefined;
    if (browserLang && ["en", "ur"].includes(browserLang)) {
      return browserLang;
    }
  }
  return defaultLocale;
}

/**
 * Persist locale to localStorage.
 */
export function setLocale(locale: SupportedLocale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_KEY, locale);
  }
}
