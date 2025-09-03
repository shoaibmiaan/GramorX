// lib/i18n/config.ts

export type SupportedLocale = "en" | "ur";

export const defaultLocale: SupportedLocale = "en";

export const supportedLocales: SupportedLocale[] = ["en", "ur"];

export const i18nConfig = {
  defaultLocale,
  locales: supportedLocales,
};
