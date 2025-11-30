import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'NUST Aggregate Calculator & Merit Predictor | Calculate Your NUST Admission Chances',
    template: '%s | NUST Aggregate Calculator',
  },
  description: 'Free NUST aggregate calculator and admission predictor. Calculate your NUST merit, check historical closing merits, predict admission chances for all programs and campuses. Official formula: NET 75%, FSc 15%, Matric 10%.',
  keywords: [
    'NUST aggregate calculator',
    'NUST merit calculator',
    'NUST admission predictor',
    'NUST closing merit',
    'NUST merit list',
    'NUST admission chances',
    'NET score calculator',
    'NUST SEECS merit',
    'NUST computer science merit',
    'Pakistan university admission',
  ],
  authors: [{ name: 'Maaz Hussain' }],
  creator: 'Maaz Hussain',
  publisher: 'NUST Aggregate Calculator',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: '/',
    siteName: 'NUST Aggregate Calculator',
    title: 'NUST Aggregate Calculator & Merit Predictor',
    description: 'Calculate your NUST aggregate, check historical merit data, and predict your admission chances for all programs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NUST Aggregate Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NUST Aggregate Calculator & Merit Predictor',
    description: 'Calculate your NUST aggregate and predict admission chances',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  category: 'Education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
