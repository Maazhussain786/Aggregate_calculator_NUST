import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About NUST Aggregate Calculator',
  description: 'Learn about the NUST Aggregate Calculator - a free tool to help Pakistani students calculate their NUST merit and predict admission chances.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            About This Project
          </h1>
          <p className="text-lg text-slate-400">
            Helping NUST aspirants make informed decisions
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Mission */}
            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-400 leading-relaxed">
                The NUST Aggregate Calculator was created to help students aspiring to join 
                the National University of Sciences and Technology (NUST) make informed decisions 
                about their applications. We provide free, accurate tools to calculate aggregates, 
                explore historical merit data, and predict admission chances.
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Aggregate Calculation</h3>
                  <p className="text-slate-400">
                    We use the official NUST aggregate formula where NET exam score carries 75% weight, 
                    FSc/HSSC carries 15%, and Matric carries 10%. For O/A Level students, we use 
                    the IBCC equivalence percentage in place of FSc marks.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Admission Predictions</h3>
                  <p className="text-slate-400">
                    Our predictions are based on rule-based analysis comparing your aggregate with 
                    historical closing data. We consider previous years&apos; closing aggregates and 
                    merit positions to estimate your chances for each program.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Merit List Prediction</h3>
                  <p className="text-slate-400">
                    NUST releases multiple merit lists (typically 6-8) during each admission cycle. 
                    We analyze historical threshold data to predict which merit list you might 
                    get selected in for your chosen program.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">Data Sources</h2>
              <p className="text-slate-400 mb-4">
                Our historical merit data is compiled from:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2">
                <li>Official NUST announcements and merit lists</li>
                <li>Educational websites and forums</li>
                <li>Community-contributed data (verified where possible)</li>
              </ul>
              <p className="text-slate-400 mt-4">
                We continuously work to improve our data accuracy. If you have verified merit 
                data to contribute, please contact us.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">Important Disclaimer</h2>
              <div className="text-amber-100/80 space-y-4">
                <p>
                  <strong>This is an unofficial tool.</strong> NUST Aggregate Calculator is not 
                  affiliated with, endorsed by, or officially connected to the National University 
                  of Sciences and Technology (NUST) in any way.
                </p>
                <p>
                  All predictions and estimates provided by this tool are for informational purposes 
                  only. Actual admission results may vary based on numerous factors including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Changes in NUST admission policies</li>
                  <li>Variations in applicant pool each year</li>
                  <li>Seat availability and quota adjustments</li>
                  <li>Other factors beyond our prediction models</li>
                </ul>
                <p className="font-semibold">
                  Always verify information with official NUST sources and make decisions accordingly.
                </p>
              </div>
            </div>

            {/* Technology */}
            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">Built With</h2>
              <div className="flex flex-wrap gap-3">
                {['Next.js', 'TypeScript', 'Tailwind CSS', 'Prisma', 'Chart.js', 'PostgreSQL'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/aggregate-calculator"
                  className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-all"
                >
                  Calculate Aggregate
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

