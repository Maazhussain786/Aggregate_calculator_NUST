import type { Metadata } from 'next';
import PositionEstimatorClient, {
  type NETType,
  type PositionDataPoint,
  type SeparateProgram,
} from './PositionEstimatorClient';
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

// Programs that publish their own separately-numbered merit list rather than
// ranking within the shared NET pool. LLB closes around #100-#264 and
// Bioinformatics around #60-#383 while the rest of their NET is in the
// thousands at the same aggregate, so pooling them would distort the curve.
// They are kept out of the pool and offered as their own curve instead.
const SEPARATELY_NUMBERED_PROGRAMS = new Set(['nls-llb', 'sines-bsbi']);

/**
 * Isotonic regression (pool-adjacent-violators).
 *
 * Points must already be sorted by aggregate descending. A lower aggregate can
 * never mean a better merit position, so the fitted positions are forced to be
 * non-decreasing. Raw pooled data violates this in places — programs close at
 * different depths and a few lists are noisy — and without the fit the estimator
 * can hand a stronger applicant a worse rank than a weaker one.
 */
function fitMonotonic(points: PositionDataPoint[]): PositionDataPoint[] {
  const blocks: { sum: number; weight: number; items: PositionDataPoint[] }[] = [];

  for (const point of points) {
    let block = { sum: point.position, weight: 1, items: [point] };
    // Merge backwards while the previous block sits above this one
    while (blocks.length > 0) {
      const prev = blocks[blocks.length - 1];
      if (prev.sum / prev.weight <= block.sum / block.weight) break;
      blocks.pop();
      block = {
        sum: prev.sum + block.sum,
        weight: prev.weight + block.weight,
        items: [...prev.items, ...block.items],
      };
    }
    blocks.push(block);
  }

  return blocks.flatMap(block => {
    const fitted = Math.max(1, Math.round(block.sum / block.weight));
    return block.items.map(item => ({ ...item, position: fitted }));
  });
}

// Transform sample data into one aggregate->position curve per NET type.
//
// NUST ranks each candidate within their NET pool, so a given aggregate maps to
// the same merit position for every program sharing that NET — Engineering
// applicants all sit on one curve, Business applicants on another.
function transformData() {
  // Latest year available for each program
  const latestYear: Record<string, number> = {};
  sampleData.meritHistory.forEach(m => {
    if (!latestYear[m.programId] || m.year > latestYear[m.programId]) {
      latestYear[m.programId] = m.year;
    }
  });

  const netTypeByProgram: Record<string, NETType> = {};
  sampleData.programs.forEach(p => {
    netTypeByProgram[p.id] = getDisciplineToNETType(p.disciplineGroup, p.school);
  });

  // Pool every program's closing points onto its NET type's curve
  const positionData = {} as Record<NETType, PositionDataPoint[]>;
  sampleData.meritHistory.forEach(m => {
    if (m.year !== latestYear[m.programId]) return;
    if (m.closingAggregate === null || m.closingMeritPosition === null) return;
    if (SEPARATELY_NUMBERED_PROGRAMS.has(m.programId)) return;

    const netType = netTypeByProgram[m.programId];
    if (!netType) return;

    (positionData[netType] ||= []).push({
      aggregate: m.closingAggregate,
      position: m.closingMeritPosition,
      meritListNumber: m.meritListNumber,
    });
  });

  // Sort by aggregate descending, then force the curve to be monotonic
  (Object.keys(positionData) as NETType[]).forEach(netType => {
    positionData[netType] = fitMonotonic(
      positionData[netType].sort((a, b) => b.aggregate - a.aggregate || a.position - b.position)
    );
  });

  // Each separately-numbered program gets its own curve from its own lists,
  // so an LLB or Bioinformatics applicant is not handed their NET pool's rank.
  const separatePrograms: SeparateProgram[] = [...SEPARATELY_NUMBERED_PROGRAMS]
    .map(programId => {
      const program = sampleData.programs.find(p => p.id === programId);
      if (!program) return null;

      const points = sampleData.meritHistory
        .filter(
          m =>
            m.programId === programId &&
            m.year === latestYear[programId] &&
            m.closingAggregate !== null &&
            m.closingMeritPosition !== null
        )
        .map(m => ({
          aggregate: m.closingAggregate as number,
          position: m.closingMeritPosition as number,
          meritListNumber: m.meritListNumber,
        }))
        .sort((a, b) => b.aggregate - a.aggregate || a.position - b.position);

      if (points.length === 0) return null;

      return {
        programId,
        programName: program.name,
        school: program.school,
        netType: netTypeByProgram[programId],
        year: latestYear[programId],
        points: fitMonotonic(points),
      };
    })
    .filter((p): p is SeparateProgram => p !== null);

  return { positionData, separatePrograms };
}

export default function PositionEstimatorPage() {
  const { positionData, separatePrograms } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Merit Position Estimator
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Estimate your likely merit position based on your NET type.
            NUST maintains separate merit lists for Engineering, Business, Applied Sciences,
            Architecture, and Natural Sciences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PositionEstimatorClient
            positionData={positionData}
            separatePrograms={separatePrograms}
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
              NUST uses different entry tests (NETs) for different disciplines, and each NET type
              has its own merit list. Your position is the same for all programs within your NET category:
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
