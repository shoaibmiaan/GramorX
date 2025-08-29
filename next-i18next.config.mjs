import path from 'path';

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ur', 'zh', 'es'],
  localeDetection: true,
};

export default {
  i18n,
  localePath: path.resolve('./public/locales'),
};
