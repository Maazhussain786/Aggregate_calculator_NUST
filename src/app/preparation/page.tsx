import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NET Preparation | Horizon Preps - Complete NUST Entry Test Course',
  description: 'Prepare for NUST Entry Test (NET) with Horizon Preps. Live lectures, chapter-wise tests, 1-to-1 mentorship, past MCQs, and mock tests for Engineering, Business, Architecture & Applied Sciences.',
  keywords: [
    'NET preparation',
    'NUST entry test preparation',
    'Horizon Preps',
    'NET coaching',
    'NUST mock test',
    'NET past papers',
    'NUST admission preparation',
    'online NET preparation',
  ],
  alternates: {
    canonical: '/preparation',
  },
};

const studentResults = [
  { name: 'Shayan Ahmed', marks: 163 },
  { name: 'Mohsin Abbas', marks: 163 },
  { name: 'M. Bilal', marks: 160 },
  { name: 'Muhammad Faizan', marks: 157 },
  { name: 'Zarrar Hayat', marks: 156 },
  { name: 'Filza Iman', marks: 154 },
  { name: 'Shahzain Ali', marks: 154 },
  { name: 'Mahad Imran', marks: 154 },
  { name: 'Nabiha Iftikhar', marks: 153 },
  { name: 'Ayesha Ahmed', marks: 152 },
  { name: 'Usman Sajjad', marks: 151 },
];

const fields = [
  { name: 'Engineering', icon: '⚙️' },
  { name: 'Architecture', icon: '🏗️' },
  { name: 'Business', icon: '📊' },
  { name: 'Applied Sciences', icon: '🔬' },
];

const offerings = [
  { name: 'Live Lectures', icon: '🎥', desc: 'Interactive online classes with expert faculty' },
  { name: 'Chapter Wise Tests', icon: '📝', desc: 'Targeted tests after every chapter' },
  { name: '1-to-1 Mentorship', icon: '🧑‍🏫', desc: 'Personalized guidance for your preparation' },
  { name: 'Past MCQs', icon: '📚', desc: 'Comprehensive collection of previous NET questions' },
  { name: 'Mock Tests', icon: '🎯', desc: 'Full-length practice exams under real conditions' },
];

export default function PreparationPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-14 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/horizon-logo.jpeg"
                  alt="Horizon Preps Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <p className="text-sm font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-2">
              In collaboration with
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
              Ace Your <span className="text-[var(--accent-primary)]">NUST Entry Test</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
              Horizon Preps offers complete NET course preparation with live lectures, mock tests, 
              past MCQs, and 1-to-1 mentorship. Students consistently score 150+ in NET.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/923285297016?text=I%20want%20to%20enroll%20in%20NET%20preparation%20course"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-8 py-4 text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enroll Now — +92 328 5297016
              </a>
              <a
                href="https://horizonpreps.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary px-8 py-4 text-base"
              >
                Visit horizonpreps.com
              </a>
            </div>
            <a
              href="https://chat.whatsapp.com/JCoqwPQyvLoApFGuyYD2sB?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#25D366] text-white text-base font-semibold hover:brightness-110 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join Free WhatsApp Group for Aspirants
            </a>
          </div>
        </div>
      </section>

      {/* Fields & Offerings */}
      <section className="py-14 bg-[var(--bg-primary)] border-y border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Fields */}
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Fields Covered</h2>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                  <div key={field.name} className="card p-4 flex items-center gap-3">
                    <span className="text-2xl">{field.icon}</span>
                    <span className="font-medium text-[var(--text-primary)]">{field.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What They Offer */}
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">What We Offer</h2>
              <div className="space-y-3">
                {offerings.map((item) => (
                  <div key={item.name} className="card p-4 flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">
              Our Students&apos; Results
            </h2>
            <p className="text-[var(--text-secondary)]">
              Horizon Preps students consistently achieve top NET scores
            </p>
          </div>

          {/* Student Photos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3]">
                <Image src="/student-1.jpeg" alt="Horizon Preps successful students" fill className="object-cover" />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3]">
                <Image src="/student-2.jpeg" alt="Horizon Preps student achievements" fill className="object-cover" />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="relative aspect-[4/3]">
                <Image src="/student-3.jpeg" alt="Horizon Preps top scorers" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {studentResults.map((student) => (
              <div key={student.name} className="card p-4 text-center">
                <p className="text-sm font-medium text-[var(--accent-primary)] mb-1">{student.name}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mono">{student.marks}</p>
                <p className="text-xs text-[var(--text-muted)]">Marks</p>
              </div>
            ))}
            <div className="card p-4 text-center bg-[var(--accent-light)] border-[var(--accent-primary)] flex flex-col items-center justify-center">
              <p className="text-sm font-bold text-[var(--accent-primary)] mb-1">Secure Your Admission</p>
              <a
                href="https://wa.me/923285297016?text=I%20want%20to%20enroll%20for%20NET%20preparation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[var(--accent-primary)] underline hover:no-underline"
              >
                ENROLL NOW!
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Free Mock Test CTA */}
      <section className="py-14 bg-[var(--bg-primary)] border-y border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Try a FREE Sample Paper
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
            Not sure if Horizon Preps is right for you? Try a free sample paper first. 
            No commitment needed — just WhatsApp us and we&apos;ll send it right away.
          </p>
          <a
            href="https://wa.me/923285297016?text=I%20want%20the%20FREE%20sample%20paper%20for%20NET%20preparation"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-10 py-4 text-base"
          >
            Get FREE Sample Paper
          </a>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            WhatsApp: +92 328 5297016 &nbsp;|&nbsp; Instagram: @horizonpreps
          </p>
        </div>
      </section>

      {/* Back to Calculator */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            Already prepared? Check where you stand.
          </p>
          <Link
            href="/aggregate-calculator"
            className="btn btn-secondary px-8 py-4"
          >
            Calculate Your Aggregate
          </Link>
        </div>
      </section>
    </div>
  );
}
