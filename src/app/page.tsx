import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import HorizonPromo from '@/components/HorizonPromo';

export const metadata: Metadata = {
  title: 'NUST Aggregate Calculator 2025 | Free Merit & Admission Predictor',
  description: 'Calculate your NUST aggregate using the official formula (NET 75%, FSc 15%, Matric 10%). Check historical closing merits and predict your admission chances for SEECS, SMME, NBS, and all NUST programs.',
  alternates: {
    canonical: '/',
  },
};

const features = [
  {
    title: 'Aggregate Calculator',
    description: 'Calculate your NUST aggregate with support for marks or percentage input. Works for FSc and O/A Level students.',
    href: '/aggregate-calculator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Merit History',
    description: 'Browse historical closing aggregates and merit positions for all programs across multiple years.',
    href: '/merit-history',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Admission Predictor',
    description: 'Get predictions for your admission chances based on your aggregate and historical data.',
    href: '/admission-predictor',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Position Estimator',
    description: 'Estimate your likely merit position based on your aggregate using historical admission data.',
    href: '/position-estimator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Preference Generator',
    description: 'Create an optimized preference list with safe, moderate, and ambitious program choices.',
    href: '/preference-generator',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Collab Logos: NUST × Horizon Preps */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* Stylized X */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  {/* Blue line of X (NUST) */}
                  <line x1="8" y1="8" x2="40" y2="40" stroke="#1e3a5f" strokeWidth="4" strokeLinecap="round" />
                  {/* Green line of X (Horizon Preps) */}
                  <line x1="40" y1="8" x2="8" y2="40" stroke="#377a78" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden">
                <Image
                  src="/horizon-logo.jpeg"
                  alt="Horizon Preps Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
              NUST Aggregate Calculator 2025
            </h1>
            
            {/* Description */}
            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Free NUST aggregate calculator 2025. Calculate your NUST admission merit using the official formula (NET 75%, FSc 15%, Matric 10%). 
              Check historical closing merits, predict admission chances, and explore merit data for all NUST programs including SEECS, SMME, NBS, and more.
            </p>
            
            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/aggregate-calculator"
                className="w-full sm:w-auto btn btn-primary px-8 py-4 text-base"
              >
                Calculate Your Aggregate
              </Link>
              <Link
                href="/merit-history"
                className="w-full sm:w-auto btn btn-secondary px-8 py-4 text-base"
              >
                View Merit History
              </Link>
            </div>

            {/* Horizon Preps CTA - Prominent */}
            <div className="mt-8 card p-4 sm:p-5 max-w-xl mx-auto border border-[var(--accent-primary)] bg-[var(--accent-light)]">
              <Link
                href="/preparation"
                className="flex flex-col sm:flex-row items-center gap-3 group"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-base sm:text-lg font-bold text-[var(--accent-primary)]">
                    Need NET Prep? Students scoring 150+ with Horizon Preps
                  </span>
                </div>
                <span className="text-sm font-semibold text-white bg-[var(--accent-primary)] px-4 py-2 rounded-lg group-hover:bg-[var(--accent-secondary)] transition-colors flex-shrink-0">
                  Learn More →
                </span>
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center sm:text-left">
                Free mock tests &amp; past papers available · WhatsApp: <a href="https://wa.me/923285297016" target="_blank" rel="noopener noreferrer" className="underline font-medium text-[var(--accent-primary)]">+92 328 5297016</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formula Section */}
      <section className="py-12 bg-[var(--bg-primary)] border-y border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Official NUST Merit Formula
            </h2>
            
            {/* FSc Formula */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">For FSc / HSSC Students</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg md:text-xl">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--accent-primary)]">NET</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">75%</span>
                </div>
                <span className="text-[var(--text-muted)]">+</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--success)]">FSc</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">15%</span>
                </div>
                <span className="text-[var(--text-muted)]">+</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--warning)]">Matric</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">10%</span>
                </div>
              </div>
            </div>

            {/* O/A Level Formula */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">For O/A Level Students</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg md:text-xl">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--accent-primary)]">NET</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">75%</span>
                </div>
                <span className="text-[var(--text-muted)]">+</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[var(--success)]">O-Level Eqv.</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Everything You Need
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Tools to help you navigate NUST admissions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="card p-6 hover:border-[var(--accent-primary)] transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent-primary)] mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Enter Your Scores</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Input your NET score, FSc marks (or percentage), and Matric marks. Supports both marks and percentage input.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Get Your Aggregate</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                See your calculated aggregate with a detailed breakdown of how each component contributes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Check Your Chances</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Compare with historical data and get predictions for your target programs.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/aggregate-calculator"
              className="btn btn-primary px-8 py-4"
            >
              Start Calculating
            </Link>
          </div>
        </div>
      </section>

      {/* Horizon Preps Recommendation */}
      <HorizonPromo />

      {/* Info Banner */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 md:p-8 border-l-4 border-l-[var(--accent-primary)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Updated for 2025 Admissions
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              This calculator uses the official NUST aggregate formula. Historical merit data is available 
              for reference. Always verify information with official NUST sources before making decisions.
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NUST Aggregate Calculator',
            alternateName: 'NUST Merit Calculator',
            description: 'Free NUST aggregate calculator 2025. Calculate your NUST admission merit using the official formula (NET 75%, FSc 15%, Matric 10%). Check historical closing merits and predict admission chances for all NUST programs.',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            softwareVersion: '1.0',
            releaseNotes: 'Updated for NUST 2025 admissions with latest merit data',
            author: {
              '@type': 'Person',
              name: 'Maaz Hussain',
            },
            publisher: {
              '@type': 'Organization',
              name: 'NUST Aggregate Calculator',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PKR',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '150',
            },
            featureList: [
              'Calculate NUST aggregate using official formula',
              'Check historical closing merits for all programs',
              'Predict admission chances',
              'Generate preference list',
              'Support for FSc and O/A Level students',
            ],
            keywords: 'NUST aggregate calculator, NUST merit calculator, NUST admission predictor, NUST closing merit, NUST aggregate formula',
          }),
        }}
      />
      
      {/* JSON-LD Structured Data - FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How to calculate NUST aggregate?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'NUST aggregate is calculated as: (NET Score/200 × 100 × 0.75) + (FSc/HSSC % × 0.15) + (Matric % × 0.10). The NET exam carries 75% weight, FSc carries 15%, and Matric carries 10%.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is the NUST aggregate formula?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The official NUST aggregate formula is: NET (75%) + FSc/HSSC (15%) + Matric (10%). For O/A Level students, IBCC equivalence percentage replaces FSc marks.',
                },
              },
              {
                '@type': 'Question',
                name: 'What is a good aggregate for NUST?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'A good aggregate varies by program. Competitive programs like Computer Science at SEECS may require 80%+, while other programs may have lower cutoffs. Check our Merit History page for specific requirements.',
                },
              },
            ],
          }),
        }}
      />
      
      {/* JSON-LD Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'NUST Aggregate Calculator',
            description: 'Free educational tool to calculate NUST admission aggregate and predict admission chances',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            sameAs: [
              'https://github.com/yourusername/nust-aggregate-calculator',
            ],
          }),
        }}
      />
    </div>
  );
}
