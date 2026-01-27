import type { Metadata } from 'next';
import PositionEstimatorClient from './PositionEstimatorClient';
import sampleData from '@/data/sampleMeritData.json';

export const metadata: Metadata = {
  title: 'NUST Merit Position Estimator | Predict Your Rank',
  description: 'Estimate your NUST merit position based on your aggregate. Get predicted rank using historical data for SEECS, SMME, NBS, and all programs.',
  keywords: [
    'NUST merit position',
    'NUST rank estimator',
    'NUST position calculator',
    'NUST merit rank',
    'NUST admission rank',
    'predict NUST position',
  ],
  alternates: {
    canonical: '/position-estimator',
  },
};

// Transform sample data for position estimation
function transformData() {
  const programs = sampleData.programs.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    campus: p.campus,
    school: p.school,
    disciplineGroup: p.disciplineGroup,
    degreeType: p.degreeType,
    seats: p.seats,
  }));

  // Get position data from merit history (latest year)
  const latestYear: Record<string, number> = {};
  sampleData.meritHistory.forEach(m => {
    if (!latestYear[m.programId] || m.year > latestYear[m.programId]) {
      latestYear[m.programId] = m.year;
    }
  });

  const positionData = sampleData.meritHistory.reduce((acc, m) => {
    if (m.year === latestYear[m.programId] && m.closingAggregate !== null && m.closingMeritPosition !== null) {
      if (!acc[m.programId]) {
        acc[m.programId] = [];
      }
      acc[m.programId].push({
        aggregate: m.closingAggregate,
        position: m.closingMeritPosition,
        meritListNumber: m.meritListNumber,
      });
    }
    return acc;
  }, {} as Record<string, Array<{ aggregate: number; position: number; meritListNumber: number | null }>>);

  return { programs, positionData };
}

export default function PositionEstimatorPage() {
  const { programs, positionData } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Merit Position Estimator
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Estimate your likely merit position for any NUST program based on your aggregate 
            and historical admission data.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PositionEstimatorClient 
            programs={programs} 
            positionData={positionData}
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            How Position Estimation Works
          </h2>
          
          <div className="space-y-6 text-[var(--text-secondary)]">
            <p>
              Our position estimator uses historical merit data to predict where you might 
              rank among applicants for a specific program. The estimation is based on:
            </p>
            
            <ul className="space-y-2 list-disc list-inside">
              <li>Closing positions from different merit lists (1st, 3rd, Final)</li>
              <li>Corresponding aggregate percentages at each position</li>
              <li>Linear interpolation between known data points</li>
            </ul>

            <div className="p-6 bg-[var(--bg-secondary)] rounded-xl mt-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Example Calculation</h3>
              <div className="space-y-2 text-sm font-mono">
                <p>If historical data shows:</p>
                <p className="pl-4">• 80.42% aggregate → Position 211</p>
                <p className="pl-4">• 77.50% aggregate → Position 621</p>
                <p className="mt-4">For 79% aggregate:</p>
                <p className="pl-4 text-[var(--accent-primary)]">
                  Position ≈ 211 + ((80.42 - 79) / (80.42 - 77.5)) × (621 - 211) = ~409
                </p>
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
