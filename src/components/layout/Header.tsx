'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

const navigation = [
  { name: 'Calculator', href: '/aggregate-calculator' },
  { name: 'Merit History', href: '/merit-history' },
  { name: 'Predictor', href: '/admission-predictor' },
  { name: 'Preferences', href: '/preference-generator' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  NUST Calculator
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--text-muted)] -mt-0.5 hidden sm:block">
                  Aggregate & Merit Predictor
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 xl:px-4 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}

            <Link
              href="/aggregate-calculator"
              className="ml-3 px-5 py-2.5 text-sm font-semibold text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-secondary)] transition-all shadow-sm"
            >
              Calculate Now
            </Link>
          </div>

          {/* Mobile: Theme toggle + Menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[var(--border-color)]">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-base font-medium text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/aggregate-calculator"
                className="mx-4 mt-3 px-5 py-3 text-center text-base font-semibold text-white bg-[var(--accent-primary)] rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Calculate Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
