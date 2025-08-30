import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Note: Do NOT include viewport meta here (Next.js warns).
  return (
    <Html lang="en">
      <Head>
        {/* Base SEO */}
        <link rel="canonical" href="https://gramorx.com" />
        <meta
          name="description"
          content="GramorX is an AI-powered platform for personalized IELTS preparation across Listening, Reading, Writing, and Speaking."
        />
        <meta
          name="keywords"
          content="IELTS, exam prep, English learning, AI, listening, reading, writing, speaking"
        />

        {/* Open Graph / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GramorX" />
        <meta property="og:title" content="GramorX – AI IELTS Prep" />
        <meta
          property="og:description"
          content="Achieve your IELTS goals with adaptive practice and real-time feedback."
        />
        <meta property="og:url" content="https://gramorx.com" />
        <meta property="og:image" content="/brand/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Fonts & Icons */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto+Slab:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

        {/* JSON-LD (combined) */}
        <script
          type="application/ld+json"
          // We can embed an array of schema objects to cover both WebSite & Organization.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'GramorX',
                url: 'https://gramorx.com',
                logo: '/brand/logo.png',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'GramorX',
                url: 'https://gramorx.com',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://gramorx.com/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
