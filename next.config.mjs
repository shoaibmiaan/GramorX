// next.config.mjs (ESM)
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable SW in dev for faster DX
  disable: process.env.NODE_ENV === 'development',
});

// Turn bypass ON by default; set BYPASS_STRICT_BUILD="0" to enforce locally/CI
const BYPASS_STRICT = process.env.BYPASS_STRICT_BUILD !== '0';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 1) Skip ESLint during production builds (warnings/errors won’t block)
  eslint: {
    ignoreDuringBuilds: BYPASS_STRICT,
  },

  // 2) Skip TS type-check failures during production builds
  typescript: {
    ignoreBuildErrors: BYPASS_STRICT,
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    // merged sizes (mobile → desktop)
    deviceSizes: [320, 420, 640, 750, 768, 828, 1024, 1080, 1200, 1920],
    // Safe SVG settings
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // good for inline display (e.g., reports/previews)
    contentDispositionType: 'inline',
  },

  // …any other Next config you already have
};

export default withPWA(nextConfig);
