import type { Metadata } from 'next';
import PositionEstimatorClient, { type NETType, type ProgramOption } from './PositionEstimatorClient';
import sampleData from '@/data/sampleMeritData.json';

export const metadata: Metadata = {
  title: 'NUST Merit Position Estimator | Predict Your Rank by NET Type',
  description: 'Estimate your NUST merit position based on your NET type (Engineering, Business, Applied Sciences, Architecture, Natural Sciences). Get predicted rank using historical data.',
  keywords: [
    'NUST merit position',
    'NUST rank estimator',
    'NUST position calculator',
    'NUST NET types',
    'NET Engineering position',
    'NET Business position',
    'NUST admission rank',
    'predict NUST position',
  ],
  alternates: {
    canonical: '/position-estimator',
  },
};

// Map discipline groups to NET types
function getDisciplineToNETType(disciplineGroup: string, school: string): NETType {
  // Business schools
  if (school === 'NBS' || school === 'S3H' || school === 'JSPPL' || school === 'NLS') {
    return 'business';
  }
  
  // Architecture
  if (school === 'SADA') {
    return 'architecture';
  }
  
  // Applied Sciences (Pre-Medical based)
  if (disciplineGroup === 'Applied Sciences' || 
      (school === 'ASAB')) {
    return 'applied-sciences';
  }
  
  // Natural Sciences (SNS)
  if (school === 'SNS') {
    return 'natural-sciences';
  }
  
  // Default: Engineering & Computing
  return 'engineering';
}

// Transform sample data into per-program position curves.
//
// Closing merit position is a PER-PROGRAM rank (each program's merit list has its
// own depth), so we build one aggregate->position curve per program rather than
// pooling every program in a NET type onto a single (non-monotonic) curve.
function transformData() {
  const programById: Record<string, (typeof sampleData.programs)[number]> = {};
  sampleData.programs.forEach(p => {
    programById[p.id] = p;
  });

  // Latest year available for each program
  const latestYear: Record<string, number> = {};
  sampleData.meritHistory.forEach(m => {
    if (!latestYear[m.programId] || m.year > latestYear[m.programId]) {
      latestYear[m.programId] = m.year;
    }
  });

  // Collect each program's own closing points (latest year, valid values only)
  const pointsByProgram: Record<string, ProgramOption['points']> = {};
  sampleData.meritHistory.forEach(m => {
    if (m.year !== latestYear[m.programId]) return;
    if (m.closingAggregate === null || m.closingMeritPosition === null) return;
    (pointsByProgram[m.programId] ||= []).push({
      aggregate: m.closingAggregate,
      position: m.closingMeritPosition,
      meritListNumber: m.meritListNumber,
    });
  });

  const programs: ProgramOption[] = Object.keys(pointsByProgram)
    .map(programId => {
      const p = programById[programId];
      return {
        programId,
        programName: p.name,
        school: p.school,
        campus: p.campus,
        netType: getDisciplineToNETType(p.disciplineGroup, p.school),
        year: latestYear[programId],
        // Sort by aggregate descending (best/earliest list first)
        points: pointsByProgram[programId].sort((a, b) => b.aggregate - a.aggregate),
      };
    })
    // Group same disciplines together, then by institute, for an easy-to-scan picker
    .sort(
      (a, b) =>
        a.programName.localeCompare(b.programName) || a.school.localeCompare(b.school)
    );

  return { programs };
}

export default function PositionEstimatorPage() {
  const { programs } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Merit Position Estimator
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Estimate your likely closing merit position for a specific NUST program.
            Every program keeps its own merit list, so your position depends on the exact
            discipline and institute you choose — not just your NET type.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PositionEstimatorClient
            programs={programs}
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Understanding NUST NET Types
          </h2>
          
          <div className="space-y-6 text-[var(--text-secondary)]">
            <p>
              NUST uses different entry tests (NETs) for different disciplines. Your NET type
              determines the test composition below, but each individual program closes at its
              own merit position — a small, high-demand program fills up far earlier than a large
              one, even within the same NET type. That is why this tool estimates your position
              for the specific program you select:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">NET-Engineering</h3>
                <p className="text-sm">Math 50%, Physics 30%, English 20%</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">All Engineering & Computing programs</p>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">NET-Business & Social Sciences</h3>
                <p className="text-sm">Quantitative Math 50%, English 50%</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">NBS, S3H, JSPPL, NLS programs</p>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">NET-Applied Sciences</h3>
                <p className="text-sm">Biology 50%, Chemistry 30%, English 20%</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">Biotechnology, Environmental Science, Agriculture</p>
              </div>
              <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">NET-Architecture</h3>
                <p className="text-sm">Design Aptitude 50%, Math 30%, English 20%</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">Architecture & Industrial Design</p>
              </div>
            </div>

            <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)] rounded-xl mt-6">
              <p className="text-sm text-[var(--warning)]">
                <strong>Disclaimer:</strong> Position estimates are based on historical data and 
                may not reflect actual results. Competition levels vary each year, affecting 
                actual merit positions. Use this as a general guide only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NUST Merit Position Estimator',
            description: 'Estimate your NUST merit position based on aggregate and historical data.',
            applicationCategory: 'EducationalApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'PKR',
            },
          }),
        }}
      />
    </div>
  );
}
