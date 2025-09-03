// lib/i18n/index.ts
import { i18nConfig, SupportedLocale } from "./config";

let currentLocale: SupportedLocale = i18nConfig.defaultLocale;
let translations: Record<string, string> = {};

/**
 * Load translations for a given locale.
 */
export async function loadTranslations(locale: SupportedLocale) {
  if (!i18nConfig.locales.includes(locale)) {
    locale = i18nConfig.defaultLocale;
  }

  try {
    const mod = await import(`@/locales/${locale}/common.json`);
    translations = mod.default;
    currentLocale = locale;
  } catch (e) {
    console.error("Failed to load translations", e);
    translations = {};
    currentLocale = i18nConfig.defaultLocale;
  }
}

/**
 * Translate a key using loaded translations.
 */
export function t(key: string): string {
  return translations[key] ?? key;
}

/**
 * Get current locale.
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}
