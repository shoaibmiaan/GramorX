import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import { Layout } from '@/components/Layout';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideChrome = ['/login', '/signup'].includes(router.pathname);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {hideChrome ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </ThemeProvider>
  );
}
