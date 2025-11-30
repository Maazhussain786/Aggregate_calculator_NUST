import type { Metadata } from 'next';
import AggregateForm from '@/components/forms/AggregateForm';

export const metadata: Metadata = {
  title: 'NUST Aggregate Calculator | Calculate Your Merit Score',
  description: 'Free NUST aggregate calculator using the official formula. NET (75%) + FSc/HSSC (15%) + Matric (10%). Calculate your exact merit score for NUST admission 2025.',
  keywords: [
    'NUST aggregate calculator',
    'NUST merit calculator',
    'NET score calculator',
    'NUST aggregate formula',
    'calculate NUST merit',
    'NUST 2025 aggregate',
  ],
  alternates: {
    canonical: '/aggregate-calculator',
  },
};

const faqs = [
  {
    question: 'What is the NUST aggregate formula?',
    answer: 'NUST aggregate is calculated as: (NET Score/200 × 100 × 0.75) + (FSc/HSSC % × 0.15) + (Matric % × 0.10). The NET exam carries 75% weight, FSc carries 15%, and Matric carries 10%.',
  },
  {
    question: 'How is NET score calculated in aggregate?',
    answer: 'Your NET score (out of 200) is first converted to percentage, then multiplied by 0.75 (75%). For example, if you score 150/200, your NET contribution is (150/200 × 100) × 0.75 = 56.25%.',
  },
  {
    question: 'What if my FSc is out of 550 marks (only 11th)?',
    answer: 'If you\'re a gap year student or your board only counts 11th class marks (550 total), you can select "550 (11th only)" option in the calculator. It will calculate your percentage correctly.',
  },
  {
    question: 'Can O/A Level students apply to NUST?',
    answer: 'Yes! O/A Level students need to obtain an IBCC equivalence certificate. The equivalence percentage is used instead of FSc marks in the aggregate calculation.',
  },
  {
    question: 'What is a good aggregate for NUST?',
    answer: 'It varies by program. Competitive programs like CS at SEECS may require 80%+, while other programs may have lower cutoffs. Check our Merit History page for specific requirements.',
  },
];

export default function AggregateCalculatorPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            NUST Aggregate Calculator
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Calculate your NUST admission aggregate using the official formula. 
            Supports both marks and percentage input.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AggregateForm showResults={true} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="card group"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <h3 className="text-[var(--text-primary)] font-medium pr-4 text-sm sm:text-base">{faq.question}</h3>
                  <span className="flex-shrink-0 text-[var(--text-muted)] group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">What&apos;s Next?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/admission-predictor"
              className="card p-5 hover:border-[var(--accent-primary)] transition-colors group"
            >
              <h3 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)] transition-colors">
                Check Admission Chances →
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                See your probability of admission for specific programs
              </p>
            </a>
            <a
              href="/merit-history"
              className="card p-5 hover:border-[var(--accent-primary)] transition-colors group"
            >
              <h3 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)] transition-colors">
                View Merit History →
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Explore historical closing merits for all programs
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
