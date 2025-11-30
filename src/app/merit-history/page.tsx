import type { Metadata } from 'next';
import MeritHistoryClient from './MeritHistoryClient';
import sampleData from '@/data/sampleMeritData.json';

export const metadata: Metadata = {
  title: 'NUST Merit History & Closing Merits | All Programs',
  description: 'Explore NUST historical merit data, closing aggregates, and merit positions for all programs. SEECS, SMME, NBS, and more. Year-wise trends from 2020-2024.',
  keywords: [
    'NUST merit history',
    'NUST closing merit',
    'NUST cutoff',
    'NUST SEECS merit',
    'NUST merit list history',
    'NUST program merits',
  ],
  alternates: {
    canonical: '/merit-history',
  },
};

// Transform sample data for the client component
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

  const meritHistory = sampleData.meritHistory.map(m => ({
    programId: m.programId,
    year: m.year,
    meritListNumber: m.meritListNumber,
    closingMeritPosition: m.closingMeritPosition,
    closingAggregate: m.closingAggregate,
    sourceName: m.sourceName,
    notes: m.notes || null,
  }));

  return { programs, meritHistory };
}

export default function MeritHistoryPage() {
  const { programs, meritHistory } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            NUST Merit History & Closing Merits
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Explore historical closing aggregates and merit positions for all NUST programs. 
            Track trends and make informed decisions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MeritHistoryClient 
            programs={programs} 
            meritHistory={meritHistory} 
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Understanding NUST Merit Lists
          </h2>
          
          <div className="space-y-6 text-slate-400">
            <p>
              NUST releases multiple merit lists during each admission cycle, typically 6-8 lists. 
              The <strong className="text-white">1st merit list</strong> has the highest cutoffs, 
              with subsequent lists having progressively lower requirements as seats are filled.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-white font-semibold mb-2">Closing Aggregate</h3>
                <p className="text-sm">
                  The minimum aggregate percentage of the last candidate admitted in a merit list. 
                  Higher closing aggregates indicate more competitive programs.
                </p>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h3 className="text-white font-semibold mb-2">Closing Position</h3>
                <p className="text-sm">
                  The merit position of the last admitted candidate. This helps understand 
                  how many students were ahead of the cutoff.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-sm text-amber-300">
                <strong>Note:</strong> Historical data is provided for reference only. 
                Actual cutoffs vary each year based on applicant pool, seat availability, 
                and other factors. Always verify with official NUST sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            NUST Programs and Campuses
          </h2>
          <p className="text-slate-400 mb-6">
            NUST offers undergraduate programs across multiple campuses including H-12 Islamabad, 
            Rawalpindi, and Karachi. Popular programs include Computer Science and Software Engineering 
            at SEECS, Mechanical Engineering at SMME, and Business programs at NBS.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {['SEECS', 'SMME', 'NBS', 'S3H', 'SNS', 'NICE', 'PNEC'].map((school) => (
              <span 
                key={school}
                className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full"
              >
                {school}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

