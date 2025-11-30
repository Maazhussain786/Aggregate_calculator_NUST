'use client';

import { useState, useCallback } from 'react';
import type { Metadata } from 'next';

// Note: Metadata needs to be in a separate server component or layout for client components
// For now, we'll add it via generateMetadata in a layout or keep this simple

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Simulate form submission (replace with actual API call later)
    try {
      // For now, just log to console
      console.log('Contact form submission:', formData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }, [formData]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (status === 'success' || status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-slate-400">
            Have questions, feedback, or data to contribute? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                <p className="text-slate-400 text-sm">
                  Send us an email and we&apos;ll get back to you within 24-48 hours.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Contribute Data</h3>
                <p className="text-slate-400 text-sm">
                  Have verified merit data? Send it our way to help other students!
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Report Issues</h3>
                <p className="text-slate-400 text-sm">
                  Found a bug or incorrect data? Let us know so we can fix it.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-6">Send a Message</h2>

                {status === 'success' && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-emerald-400">
                      Thank you for your message! We&apos;ll get back to you soon.
                    </p>
                  </div>
                )}

                {status === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400">
                      Something went wrong. Please try again later.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="data">Data Contribution</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Your message..."
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

