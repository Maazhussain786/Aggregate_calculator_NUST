import type { Metadata } from 'next';
import AdmissionPredictorClient from './AdmissionPredictorClient';
import sampleData from '@/data/sampleMeritData.json';

export const metadata: Metadata = {
  title: 'NUST Admission Predictor | Check Your Chances',
  description: 'Predict your NUST admission chances for any program. AI-powered analysis based on historical merit data. Get detailed predictions for SEECS, SMME, NBS, and all programs.',
  keywords: [
    'NUST admission chances',
    'NUST admission predictor',
    'NUST merit predictor',
    'will I get into NUST',
    'NUST admission calculator',
    'NUST chance calculator',
  ],
  alternates: {
    canonical: '/admission-predictor',
  },
};

// Transform sample data
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

  // Get latest year data for each program (for display purposes)
  const latestMeritData = sampleData.meritHistory.reduce((acc, m) => {
    const key = m.programId;
    if (!acc[key] || m.year > acc[key].year || 
        (m.year === acc[key].year && (!m.meritListNumber || m.meritListNumber === 1))) {
      acc[key] = m;
    }
    return acc;
  }, {} as Record<string, typeof sampleData.meritHistory[0]>);

  // Get all merit history for the latest year per program (for predictions)
  const latestYear: Record<string, number> = {};
  sampleData.meritHistory.forEach(m => {
    if (!latestYear[m.programId] || m.year > latestYear[m.programId]) {
      latestYear[m.programId] = m.year;
    }
  });

  const allMeritHistory = sampleData.meritHistory.reduce((acc, m) => {
    if (m.year === latestYear[m.programId]) {
      if (!acc[m.programId]) {
        acc[m.programId] = [];
      }
      acc[m.programId].push({
        meritListNumber: m.meritListNumber,
        closingAggregate: m.closingAggregate,
        closingMeritPosition: m.closingMeritPosition,
      });
    }
    return acc;
  }, {} as Record<string, Array<{ meritListNumber: number | null; closingAggregate: number | null; closingMeritPosition: number | null }>>);

  return { programs, latestMeritData, allMeritHistory };
}

export default function AdmissionPredictorPage() {
  const { programs, latestMeritData, allMeritHistory } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            NUST Admission Predictor
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Calculate your aggregate and predict your admission chances for any NUST program. 
            Get insights based on historical merit data.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdmissionPredictorClient 
            programs={programs} 
            latestMeritData={latestMeritData}
            allMeritHistory={allMeritHistory}
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            How Prediction Works
          </h2>
          
          <div className="space-y-6 text-[var(--text-secondary)]">
            <p>
              Our admission predictor uses rule-based analysis comparing your aggregate 
              with historical closing data to estimate your chances. The prediction considers:
            </p>
            
            <ul className="space-y-2 list-disc list-inside">
              <li>Your calculated aggregate vs. last year&apos;s closing aggregate</li>
              <li>Historical trends for the selected program</li>
              <li>Merit list thresholds from previous years</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="card p-4 rounded-xl text-center">
                <div className="text-[var(--success)] font-semibold mb-1">High Chance</div>
                <div className="text-sm text-[var(--text-secondary)]">Aggregate 2%+ above closing</div>
              </div>
              <div className="card p-4 rounded-xl text-center">
                <div className="text-[var(--warning)] font-semibold mb-1">Medium Chance</div>
                <div className="text-sm text-[var(--text-secondary)]">Within ±1% of closing</div>
              </div>
              <div className="card p-4 rounded-xl text-center">
                <div className="text-[var(--error)] font-semibold mb-1">Low Chance</div>
                <div className="text-sm text-[var(--text-secondary)]">More than 1% below closing</div>
              </div>
            </div>

            <div className="card p-4 rounded-xl mt-6">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong>Disclaimer:</strong> Predictions are estimates based on historical data. 
                Actual results depend on many factors including applicant pool, seat availability, 
                and yearly variations. Always verify with official NUST sources.
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
            name: 'NUST Admission Predictor',
            description: 'Predict your chances of admission to NUST programs based on your aggregate and historical data.',
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

