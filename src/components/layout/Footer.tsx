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
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-primary)] border-t-4 border-[var(--border-color)]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      {/* Pixel line decoration */}
      <div className="h-1 bg-[var(--bg-secondary)]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, var(--border-color) 0px, var(--border-color) 8px, transparent 8px, transparent 16px)`
      }} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 border-2 border-[var(--border-color)] p-1 bg-[var(--bg-card)]">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <span className="text-[var(--text-primary)]" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
                NUST CALC
              </span>
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
              className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] border-2 border-transparent hover:border-[var(--border-color)] px-2 py-1 transition-colors"
            >
              [GitHub]
            </a>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[var(--text-primary)] uppercase tracking-wider border-b-2 border-[var(--border-color)] pb-2 inline-block" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
              ▸ Tools
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] px-1 transition-colors"
                  >
                    {'>'} {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[var(--text-primary)] uppercase tracking-wider border-b-2 border-[var(--border-color)] pb-2 inline-block" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
              ▸ Info
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] px-1 transition-colors"
                  >
                    {'>'} {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[var(--text-primary)] uppercase tracking-wider border-b-2 border-[var(--border-color)] pb-2 inline-block" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.5rem' }}>
              ▸ Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] px-1 transition-colors"
                  >
                    {'>'} {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t-4 border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              © {currentYear} NUST CALC. All rights reserved.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              DEV:{' '}
              <a 
                href="https://github.com/Maazhussain786" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] px-1"
              >
                @MAAZ_HUSSAIN
              </a>
            </p>
          </div>
          <p className="mt-4 text-xs text-[var(--text-muted)] text-center md:text-left border-2 border-dashed border-[var(--border-color)] p-2 opacity-70">
            ! DISCLAIMER: This is an unofficial tool. Always verify information with official NUST sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
