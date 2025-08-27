import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    JAZZCASH_MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID ?? 'demo_merchant',
    JAZZCASH_PASSWORD: process.env.JAZZCASH_PASSWORD ?? 'demo_password',
    JAZZCASH_SECRET: process.env.JAZZCASH_SECRET ?? 'demo_secret',
    EASYPAISA_STORE_ID: process.env.EASYPAISA_STORE_ID ?? 'demo_store',
    EASYPAISA_SECRET: process.env.EASYPAISA_SECRET ?? 'demo_secret',
    CARD_GATEWAY_API_KEY: process.env.CARD_GATEWAY_API_KEY ?? 'demo_key',
    CARD_GATEWAY_SECRET: process.env.CARD_GATEWAY_SECRET ?? 'demo_secret',
  },
  pwa: {
    additionalManifestEntries: [
      { url: '/brand/logo.png', revision: null },
      { url: '/locales/en/common.json', revision: null },
      { url: '/locales/ur/common.json', revision: null },
      { url: '/premium.css', revision: null },
    ],
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  swSrc: 'public/sw.js',
})(nextConfig);
