import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GramorX helps you prepare for the IELTS exam with interactive lessons and mock tests." />
        <meta name="author" content="GramorX" />
        <link rel="canonical" href="https://gramorx.com" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GramorX" />
        <meta property="og:title" content="GramorX" />
        <meta property="og:description" content="Prepare for IELTS with GramorX's comprehensive platform." />
        <meta property="og:url" content="https://gramorx.com" />
        <meta property="og:image" content="/brand/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto+Slab:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'GramorX',
              url: 'https://gramorx.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://gramorx.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
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
