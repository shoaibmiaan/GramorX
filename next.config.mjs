// next.config.mjs (ESM)
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // No SW in dev to avoid caching headaches
  disable: process.env.NODE_ENV === 'development',
});

// Turn bypass ON by default; set to "0" to enforce locally/CI
const BYPASS_STRICT = process.env.BYPASS_STRICT_BUILD !== '0';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Silence the Next.js dev warning for cross-origin requests in dev
  experimental: {
    allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },

  // Tree-shake large icon libs & common UI libs
  modularizeImports: {
    'lucide-react': { transform: 'lucide-react/icons/{{member}}' },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    'react-icons/?(((\\w*)?/?)*)': {
      transform: 'react-icons/{{matches.[1]}}',
    },
  },

  // Hint Next to optimize package imports for common UI deps
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-select',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-toggle',
  ],

  // Skip ESLint/TS blocking the build when BYPASS_STRICT is enabled
  eslint: { ignoreDuringBuilds: BYPASS_STRICT },
  typescript: { ignoreBuildErrors: BYPASS_STRICT },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },

  // …any other Next config you need
};

export default withPWA(nextConfig);
