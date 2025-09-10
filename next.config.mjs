// next.config.mjs (ESM)
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // no SW in dev to avoid caching headaches
  disable: process.env.NODE_ENV === 'development',
});

// Turn bypass ON by default; set to "0" to enforce locally/CI
const BYPASS_STRICT = process.env.BYPASS_STRICT_BUILD !== '0';

// Derive the exact Supabase host from env (required for next/image)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHost = SUPABASE_URL ? new URL(SUPABASE_URL).host : null;

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

  // ✅ Single images block with remotePatterns + formats/etc
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    remotePatterns: [
      // Allow Supabase Storage objects like:
      // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<file>
      supabaseHost && {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/**',
      },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ].filter(Boolean),
  },
};

export default withPWA(nextConfig);
