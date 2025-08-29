import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export const useLocale = () => {
  const router = useRouter();
  const { i18n, t } = useTranslation('common');

  const setLocale = (lng: string) => {
    router.push(router.pathname, router.asPath, { locale: lng });
  };

  const setExplanationLocale = setLocale;

  return {
    locale: i18n.language,
    setLocale,
    explanationLocale: i18n.language,
    setExplanationLocale,
    t,
  } as const;
};
