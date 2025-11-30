import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for NUST Aggregate Calculator',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="animate-fade-in">
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Terms of Service
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
            <p className="text-lg">
              Last updated: November 2025
            </p>

            <h2 className="text-xl font-semibold text-white">Acceptance of Terms</h2>
            <p>
              By accessing and using NUST Aggregate Calculator, you accept and agree to be 
              bound by these Terms of Service. If you do not agree to these terms, please 
              do not use our service.
            </p>

            <h2 className="text-xl font-semibold text-white">Description of Service</h2>
            <p>
              NUST Aggregate Calculator provides free tools to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Calculate NUST admission aggregate scores</li>
              <li>View historical merit data</li>
              <li>Predict admission chances</li>
              <li>Generate preference order recommendations</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">Disclaimer</h2>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300">
                <strong>IMPORTANT:</strong> This is an unofficial tool. NUST Aggregate Calculator 
                is NOT affiliated with, endorsed by, or officially connected to the National 
                University of Sciences and Technology (NUST) in any way.
              </p>
            </div>
            <p className="mt-4">
              All calculations, predictions, and estimates provided by this tool are for 
              <strong className="text-white"> informational purposes only</strong>. They should 
              not be relied upon as official or guaranteed outcomes.
            </p>

            <h2 className="text-xl font-semibold text-white">Accuracy of Information</h2>
            <p>
              While we strive to provide accurate information:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Historical merit data may not be 100% complete or accurate</li>
              <li>Predictions are estimates based on historical patterns</li>
              <li>Actual admission results depend on many factors beyond our models</li>
              <li>NUST policies may change without notice</li>
            </ul>
            <p className="mt-4">
              Always verify information with official NUST sources before making important decisions.
            </p>

            <h2 className="text-xl font-semibold text-white">Limitation of Liability</h2>
            <p>
              NUST Aggregate Calculator and its operators shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Any decisions made based on information from this tool</li>
              <li>Admission outcomes that differ from predictions</li>
              <li>Any direct, indirect, or consequential damages</li>
              <li>Loss of opportunity or any other losses</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">User Responsibilities</h2>
            <p>
              By using this service, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Verify all information with official sources</li>
              <li>Not rely solely on this tool for admission decisions</li>
              <li>Use the service for personal, non-commercial purposes</li>
              <li>Not attempt to manipulate or abuse the service</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">Intellectual Property</h2>
            <p>
              All content, design, and functionality of NUST Aggregate Calculator are 
              protected by intellectual property rights. You may not copy, modify, or 
              distribute our content without permission.
            </p>

            <h2 className="text-xl font-semibold text-white">Service Availability</h2>
            <p>
              We strive to maintain service availability but do not guarantee uninterrupted 
              access. The service may be modified, suspended, or discontinued at any time 
              without notice.
            </p>

            <h2 className="text-xl font-semibold text-white">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of 
              the service after changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-white">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws 
              of Pakistan.
            </p>

            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p>
              For questions about these terms, please{' '}
              <a href="/contact" className="text-emerald-400 hover:text-emerald-300">
                contact us
              </a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

