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

  // Tree-shake icon libs
  modularizeImports: {
    'lucide-react': { transform: 'lucide-react/icons/{{member}}' },
    '@heroicons/react/24/solid': { transform: '@heroicons/react/24/solid/{{member}}' },
    '@heroicons/react/24/outline': { transform: '@heroicons/react/24/outline/{{member}}' },
    'react-icons/?(((\\w*)?/?)*)': { transform: 'react-icons/{{matches.[1]}}' },
  },

  // Don’t block builds on lint/type errors when bypassing
  eslint: { ignoreDuringBuilds: BYPASS_STRICT },
  typescript: { ignoreBuildErrors: BYPASS_STRICT },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
};

export default withPWA(nextConfig);
