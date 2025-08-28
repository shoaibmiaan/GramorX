// next.config.mjs (ESM)
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // no SW in dev
  // Do NOT set "sw" here unless you intentionally use InjectManifest
});

const nextConfig = {
  reactStrictMode: true,
  // ...any other Next config you already have
};

export default withPWA(nextConfig);
