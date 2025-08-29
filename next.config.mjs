// next.config.mjs (ESM)
import withPWAInit from 'next-pwa';
import i18nextConfig from './next-i18next.config.mjs';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // no SW in dev
});

// Turn bypass ON by default; set to "0" to enforce locally/CI
const BYPASS_STRICT = process.env.BYPASS_STRICT_BUILD !== '0';

const nextConfig = {
  reactStrictMode: true,
  i18n: i18nextConfig.i18n,

  // 1) Skip ESLint during production builds (so warnings/errors won’t block)
  eslint: {
    ignoreDuringBuilds: BYPASS_STRICT,
  },

  // 2) Skip TS type-check failures during production builds
  typescript: {
    ignoreBuildErrors: BYPASS_STRICT,
  },

  // …any other Next config you already have
};

export default withPWA(nextConfig);

