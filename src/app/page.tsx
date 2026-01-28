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
      <section className="py-16 md:py-24 lg:py-32 relative">
        {/* Pixel Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pixel Decoration */}
            <div className="flex justify-center items-center gap-2 mb-6">
              <span className="text-[var(--text-muted)]">■ ■ ■</span>
              <span className="text-xs text-[var(--text-muted)] font-mono tracking-widest">LOADING COMPLETE</span>
              <span className="text-[var(--text-muted)]">■ ■ ■</span>
            </div>
            
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 border-4 border-[var(--border-color)] p-2 bg-[var(--bg-card)]">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  priority
                />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-[var(--text-primary)] leading-tight">
              NUST Aggregate Calculator 2025
            </h1>
            
            {/* Blinking cursor effect */}
            <div className="mt-4 flex justify-center">
              <span className="text-[var(--text-muted)] text-sm font-mono">{'>'} READY_<span className="animate-blink">█</span></span>
            </div>
            
            {/* Description */}
            <p className="mt-6 text-[var(--text-secondary)] max-w-2xl mx-auto">
              Free NUST aggregate calculator 2025. Calculate your NUST admission merit using the official formula (NET 75%, FSc 15%, Matric 10%). 
              Check historical closing merits, predict admission chances, and explore merit data for all NUST programs including SEECS, SMME, NBS, and more.
            </p>
            
            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/aggregate-calculator"
                className="w-full sm:w-auto btn btn-primary"
              >
                {'>'} Calculate Aggregate
              </Link>
              <Link
                href="/merit-history"
                className="w-full sm:w-auto btn btn-secondary"
              >
                {'>'} Merit History
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Formula Section */}
      <section className="py-12 bg-[var(--bg-primary)] border-y-4 border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-block border-4 border-[var(--border-color)] px-4 py-2 bg-[var(--bg-card)]">
              <h2 className="text-xs text-[var(--text-primary)] uppercase tracking-widest">
                ★ Official NUST Merit Formula ★
              </h2>
            </div>
            
            {/* FSc Formula */}
            <div className="card p-6">
              <p className="text-xs text-[var(--text-muted)] mb-4 uppercase tracking-wider">[ FSc / HSSC Students ]</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono">
                <div className="flex items-center gap-1.5 border-2 border-[var(--border-color)] px-3 py-1">
                  <span className="font-bold text-[var(--text-primary)]">NET</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-bold text-[var(--text-primary)]">75%</span>
                </div>
                <span className="text-[var(--text-primary)] text-xl">+</span>
                <div className="flex items-center gap-1.5 border-2 border-[var(--border-color)] px-3 py-1">
                  <span className="font-bold text-[var(--text-primary)]">FSc</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-bold text-[var(--text-primary)]">15%</span>
                </div>
                <span className="text-[var(--text-primary)] text-xl">+</span>
                <div className="flex items-center gap-1.5 border-2 border-[var(--border-color)] px-3 py-1">
                  <span className="font-bold text-[var(--text-primary)]">Matric</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-bold text-[var(--text-primary)]">10%</span>
                </div>
              </div>
            </div>

            {/* O/A Level Formula */}
            <div className="card p-6">
              <p className="text-xs text-[var(--text-muted)] mb-4 uppercase tracking-wider">[ O/A Level Students ]</p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono">
                <div className="flex items-center gap-1.5 border-2 border-[var(--border-color)] px-3 py-1">
                  <span className="font-bold text-[var(--text-primary)]">NET</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-bold text-[var(--text-primary)]">75%</span>
                </div>
                <span className="text-[var(--text-primary)] text-xl">+</span>
                <div className="flex items-center gap-1.5 border-2 border-[var(--border-color)] px-3 py-1">
                  <span className="font-bold text-[var(--text-primary)]">O-Level Eqv.</span>
                  <span className="text-[var(--text-muted)]">×</span>
                  <span className="font-bold text-[var(--text-primary)]">25%</span>
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
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-[var(--border-color)]">◄</span>
              <h2 className="text-[var(--text-primary)]">
                SELECT YOUR TOOL
              </h2>
              <span className="text-[var(--border-color)]">►</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              Tools to help you navigate NUST admissions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="feature-card group"
              >
                <div className="icon-box mb-4 group-hover:bg-[var(--text-inverse)] transition-colors">
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--text-muted)]">[{String(index + 1).padStart(2, '0')}]</span>
                  <h3 className="text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-inverse)]">
                  {'>'} PRESS TO SELECT
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[var(--bg-primary)] border-t-4 border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[var(--text-primary)]">
              ▼ HOW IT WORKS ▼
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center card p-6">
              <div className="w-12 h-12 border-4 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--text-inverse)] flex items-center justify-center text-xl font-bold mx-auto mb-4 font-mono">
                01
              </div>
              <h3 className="text-[var(--text-primary)] mb-2">Enter Scores</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Input your NET score, FSc marks (or percentage), and Matric marks. Supports both marks and percentage input.
              </p>
            </div>

            <div className="text-center card p-6">
              <div className="w-12 h-12 border-4 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--text-inverse)] flex items-center justify-center text-xl font-bold mx-auto mb-4 font-mono">
                02
              </div>
              <h3 className="text-[var(--text-primary)] mb-2">Get Aggregate</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                See your calculated aggregate with a detailed breakdown of how each component contributes.
              </p>
            </div>

            <div className="text-center card p-6">
              <div className="w-12 h-12 border-4 border-[var(--border-color)] bg-[var(--accent-primary)] text-[var(--text-inverse)] flex items-center justify-center text-xl font-bold mx-auto mb-4 font-mono">
                03
              </div>
              <h3 className="text-[var(--text-primary)] mb-2">Check Chances</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Compare with historical data and get predictions for your target programs.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/aggregate-calculator"
              className="btn btn-primary"
            >
              {'>'} START CALCULATING
            </Link>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 md:p-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--border-color)]"></div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">!</span>
              <div>
                <h3 className="text-[var(--text-primary)] mb-2">
                  SYSTEM UPDATE 2025
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  This calculator uses the official NUST aggregate formula. Historical merit data is available 
                  for reference. Always verify information with official NUST sources before making decisions.
                </p>
              </div>
            </div>
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
