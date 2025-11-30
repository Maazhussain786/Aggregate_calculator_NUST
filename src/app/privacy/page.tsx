import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for NUST Aggregate Calculator',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="animate-fade-in">
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
            <p className="text-lg">
              Last updated: November 2025
            </p>

            <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
            <p>
              NUST Aggregate Calculator is designed with privacy in mind. We collect minimal data:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Calculator Input:</strong> The scores you enter 
                (NET, FSc, Matric) are processed locally in your browser and are not stored on our servers.
              </li>
              <li>
                <strong className="text-white">Contact Form:</strong> If you submit a contact form, 
                we collect your name, email, and message to respond to your inquiry.
              </li>
              <li>
                <strong className="text-white">Analytics:</strong> We may use anonymous analytics 
                to understand how our site is used. This data does not identify individual users.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
            <p>
              We use collected information solely to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Respond to contact form submissions</li>
              <li>Improve our calculator and prediction tools</li>
              <li>Understand overall usage patterns</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">Data Storage</h2>
            <p>
              Your calculation inputs are processed entirely in your browser. We do not store 
              your personal academic scores on our servers unless you explicitly submit them 
              through a form.
            </p>

            <h2 className="text-xl font-semibold text-white">Cookies</h2>
            <p>
              We may use essential cookies for site functionality. These do not track your 
              personal information or browsing activity across other websites.
            </p>

            <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
            <p>
              We may use third-party services for:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Website hosting (Vercel)</li>
              <li>Anonymous analytics</li>
            </ul>
            <p>
              These services have their own privacy policies and data handling practices.
            </p>

            <h2 className="text-xl font-semibold text-white">Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Request deletion of any contact form data</li>
              <li>Opt out of analytics tracking</li>
              <li>Contact us with privacy-related questions</li>
            </ul>

            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <p>
              For privacy-related inquiries, please use our{' '}
              <a href="/contact" className="text-emerald-400 hover:text-emerald-300">
                contact form
              </a>.
            </p>

            <h2 className="text-xl font-semibold text-white">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be posted 
              on this page with an updated revision date.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

