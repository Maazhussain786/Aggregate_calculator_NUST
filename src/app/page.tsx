import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

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
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
              NUST Aggregate
              <br />
              <span className="text-[var(--accent-primary)]">Calculator</span>
            </h1>
            
            {/* Description */}
            <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Calculate your NUST admission aggregate, explore historical merit data, 
              and check your chances for any program. Free and updated for 2025 admissions.
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

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NUST Aggregate Calculator',
            description: 'Calculate NUST aggregate and predict admission chances using historical merit data.',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Any',
            author: {
              '@type': 'Person',
              name: 'Maaz Hussain',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PKR',
            },
          }),
        }}
      />
    </div>
  );
}
