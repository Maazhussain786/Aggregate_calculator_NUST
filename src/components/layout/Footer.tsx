import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  tools: [
    { name: 'Aggregate Calculator', href: '/aggregate-calculator' },
    { name: 'Merit History', href: '/merit-history' },
    { name: 'Admission Predictor', href: '/admission-predictor' },
    { name: 'Preference Generator', href: '/preference-generator' },
  ],
  resources: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-color)]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">NUST Calculator</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              Your comprehensive guide to NUST admissions. Calculate aggregate, check merit history, 
              and predict your admission chances.
            </p>
            
            {/* GitHub Link */}
            <a
              href="https://github.com/Maazhussain786"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Tools</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              © {currentYear} NUST Aggregate Calculator. All rights reserved.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Developed by{' '}
              <a 
                href="https://github.com/Maazhussain786" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-[var(--accent-primary)] hover:underline"
              >
                Maaz Hussain
              </a>
            </p>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)] text-center md:text-left">
            Disclaimer: This is an unofficial tool. Always verify information with official NUST sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
