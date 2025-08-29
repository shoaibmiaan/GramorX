import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { NextIntlProvider, createTranslator } from 'next-intl';

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
  try {
    const res = await fetch(`/locales/${locale}/common.json`);
    if (!res.ok) throw new Error('Failed to load');
    return (await res.json()) as Record<string, any>;
  } catch {
    return {} as Record<string, any>;
  }
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [explanationLocale, setExplanationLocale] = useState('en');
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);

  const translator = useMemo(
    () => createTranslator({ locale, messages }),
    [locale, messages]
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        explanationLocale,
        setExplanationLocale,
        t: (key: string) => translator(key) as string,
      }}
    >
      <NextIntlProvider locale={locale} messages={messages}>
        {children}
      </NextIntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
