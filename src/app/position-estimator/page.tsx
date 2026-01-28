import type { Metadata } from 'next';
import PositionEstimatorClient, { type NETType } from './PositionEstimatorClient';
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

// Transform sample data for position estimation by NET type
function transformData() {
  // Get position data from merit history grouped by NET type
  const latestYear: Record<string, number> = {};
  sampleData.meritHistory.forEach(m => {
    if (!latestYear[m.programId] || m.year > latestYear[m.programId]) {
      latestYear[m.programId] = m.year;
    }
  });

  // Create a map of program to NET type
  const programToNETType: Record<string, NETType> = {};
  sampleData.programs.forEach(p => {
    programToNETType[p.id] = getDisciplineToNETType(p.disciplineGroup, p.school);
  });

  // Aggregate position data by NET type
  const positionData = sampleData.meritHistory.reduce((acc, m) => {
    const netType = programToNETType[m.programId];
    if (!netType) return acc;
    
    if (m.year === latestYear[m.programId] && m.closingAggregate !== null && m.closingMeritPosition !== null) {
      if (!acc[netType]) {
        acc[netType] = [];
      }
      acc[netType].push({
        aggregate: m.closingAggregate,
        position: m.closingMeritPosition,
        meritListNumber: m.meritListNumber,
      });
    }
    return acc;
  }, {} as Record<NETType, Array<{ aggregate: number; position: number; meritListNumber: number | null }>>);

  // Sort and deduplicate data points for each NET type
  Object.keys(positionData).forEach(netType => {
    // Sort by aggregate descending
    positionData[netType as NETType].sort((a, b) => b.aggregate - a.aggregate);
  });

  return { positionData };
}

export default function PositionEstimatorPage() {
  const { positionData } = transformData();

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
            NUST maintains separate merit lists for Engineering, Business, Applied Sciences, Architecture, and Natural Sciences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PositionEstimatorClient 
            positionData={positionData}
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
