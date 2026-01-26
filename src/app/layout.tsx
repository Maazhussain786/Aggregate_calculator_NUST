import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'NUST Aggregate Calculator 2025 | Free NUST Merit Calculator & Admission Predictor',
    template: '%s | NUST Aggregate Calculator',
  },
  description: 'Free NUST aggregate calculator 2025. Calculate NUST merit using official formula (NET 75%, FSc 15%, Matric 10%). Check NUST closing merits, predict admission chances for SEECS, SMME, NBS, and all programs. Updated for 2025 admissions.',
  keywords: [
    'NUST aggregate calculator',
    'NUST aggregate calculator 2025',
    'NUST merit calculator',
    'NUST admission calculator',
    'NUST aggregate formula',
    'calculate NUST aggregate',
    'NUST NET calculator',
    'NUST admission predictor',
    'NUST closing merit',
    'NUST merit list 2025',
    'NUST admission chances',
    'NUST SEECS merit',
    'NUST computer science merit',
    'NUST software engineering merit',
    'NUST SMME merit',
    'NUST NBS merit',
    'NUST aggregate percentage',
    'NUST merit position',
    'Pakistan NUST admission',
    'NUST entry test calculator',
    'NUST aggregate score',
    'NUST merit list history',
    'NUST closing aggregate',
    'NUST admission aggregate',
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
    title: 'NUST Aggregate Calculator 2025 | Free NUST Merit Calculator',
    description: 'Free NUST aggregate calculator 2025. Calculate your NUST merit using official formula (NET 75%, FSc 15%, Matric 10%). Check closing merits and predict admission chances.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NUST Aggregate Calculator - Calculate Your NUST Admission Merit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NUST Aggregate Calculator 2025 | Free NUST Merit Calculator',
    description: 'Calculate your NUST aggregate and predict admission chances for all programs. Free tool for 2025 admissions.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  category: 'Education',
  icons: {
    icon: '/nust-logo.png',
    shortcut: '/nust-logo.png',
    apple: '/nust-logo.png',
  },
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
        <Analytics />
      </body>
    </html>
  );
}
