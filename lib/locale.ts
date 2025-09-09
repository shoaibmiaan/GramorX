// lib/locale.ts
// Minimal locale helper for Pages Router (SSR-safe)

export type Locale = 'en' | 'ur' | 'ar' | 'fr'; // add/remove as needed
const STORAGE_KEY = 'locale';

let current: Locale | null = null;

// SSR-safe getter
export function getLocale(defaultLocale: Locale = 'en'): Locale {
  if (typeof window === 'undefined') return current ?? defaultLocale;
  const saved = (localStorage.getItem(STORAGE_KEY) as Locale | null) ?? null;
  current = saved ?? current ?? defaultLocale;
  return current;
}

// Persist + update <html lang="">
export function setLocale(next: Locale): void {
  current = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next);
    try {
      document.documentElement.setAttribute('lang', next);
    } catch {}
  }
}

// (Optional) Load translation JSON into a global cache (client only).
// Adjust the fetch path to your actual public JSON files.
type Dict = Record<string, string>;
declare global {
  interface Window { __i18n?: Record<Locale, Dict>; }
}
export async function loadTranslations(next: Locale): Promise<Dict> {
  if (typeof window === 'undefined') return {};
  window.__i18n = window.__i18n ?? {};
  if (window.__i18n[next]) return window.__i18n[next];

  const res = await fetch(`/locales/${next}.json`, { cache: 'force-cache' });
  if (!res.ok) return {};
  const dict = (await res.json()) as Dict;
  window.__i18n[next] = dict;
  return dict;
}
