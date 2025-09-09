// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GramorX',
    url: 'https://gramorx.com',
    logo: '/brand/logo.png',
  };

  return (
    <Html lang="en" className="bg-background text-foreground">
      <Head>
        {/* DO NOT add viewport here; Next.js handles it per-page */}

        {/* Base SEO */}
        <meta
          name="description"
          content="GramorX is an AI-powered platform for personalized IELTS preparation across Listening, Reading, Writing, and Speaking."
        />
        <meta
          name="keywords"
          content="IELTS, exam prep, English learning, AI, listening, reading, writing, speaking"
        />

        {/* Color scheme & theme */}
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

        {/* Open Graph / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GramorX – AI IELTS Prep" />
        <meta
          property="og:description"
          content="Achieve your IELTS goals with adaptive practice and real-time feedback."
        />
        <meta property="og:url" content="https://gramorx.com" />
        <meta property="og:image" content="/brand/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Preconnects (safe QoL) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* We use next/font in _app to load Poppins & Roboto Slab; avoid double-loading via Google Fonts link */}

        {/* PWA + Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </Head>
      <body className="bg-background text-foreground antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
