'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

const navigation = [
  { name: 'Calculator', href: '/aggregate-calculator' },
  { name: 'Merit History', href: '/merit-history' },
  { name: 'Predictor', href: '/admission-predictor' },
  { name: 'Position', href: '/position-estimator' },
  { name: 'Preferences', href: '/preference-generator' },
  { name: 'About', href: '/about' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Use requestAnimationFrame to batch the mount state update
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)] border-b-4 border-[var(--border-color)]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 border-2 border-[var(--border-color)] p-1 bg-[var(--bg-card)]">
                <Image
                  src="/nust-logo.png"
                  alt="NUST Logo"
                  fill
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '0.625rem' }}>
                  NUST CALC
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--text-muted)] hidden sm:block font-mono">
                  v2025.1
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
                className="px-3 xl:px-4 py-2 text-sm text-[var(--text-secondary)] border-2 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-color)] transition-all"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] transition-all"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <span className="text-lg">☾</span>
                ) : (
                  <span className="text-lg">☀</span>
                )}
              </button>
            )}

            <Link
              href="/aggregate-calculator"
              className="ml-3 btn btn-primary text-xs"
            >
              {'>'} CALC
            </Link>
          </div>

          {/* Mobile: Theme toggle + Menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)] transition-all"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <span className="text-lg">☾</span>
                ) : (
                  <span className="text-lg">☀</span>
                )}
              </button>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center border-2 border-[var(--border-color)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="text-lg font-bold">
                {mobileMenuOpen ? '✕' : '≡'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t-4 border-[var(--border-color)]">
            <div className="flex flex-col space-y-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-base text-[var(--text-secondary)] border-2 border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  [{String(index + 1).padStart(2, '0')}] {item.name}
                </Link>
              ))}
              <Link
                href="/aggregate-calculator"
                className="mx-4 mt-3 btn btn-primary text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {'>'} CALCULATE NOW
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
