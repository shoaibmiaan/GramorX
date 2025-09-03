import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocaleContextValue {
  locale: string;
  setLocale: (lng: string) => void;
  explanationLocale: string;
  setExplanationLocale: (lng: string) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
  explanationLocale: 'en',
  setExplanationLocale: () => {},
  t: (key: string) => key,
});

async function loadMessages(locale: string) {
  const fetchJson = async (path: string) => {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error('Failed to load');
      return (await res.json()) as Record<string, any>;
    } catch {
      return {} as Record<string, any>;
    }
  };
  const [common, home] = await Promise.all([
    fetchJson(`/locales/${locale}/common.json`),
    fetchJson(`/locales/${locale}/home.json`),
  ]);
  return { ...common, home } as Record<string, any>;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [explanationLocale, setExplanationLocale] = useState('en');
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);

  const t = (key: string): string => {
    return key.split('.').reduce((obj: any, part: string) => (obj ? obj[part] : undefined), messages) ?? key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, explanationLocale, setExplanationLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
