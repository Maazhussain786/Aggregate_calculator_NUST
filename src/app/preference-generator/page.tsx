import type { Metadata } from 'next';
import PreferenceGeneratorClient from './PreferenceGeneratorClient';
import sampleData from '@/data/sampleMeritData.json';

export const metadata: Metadata = {
  title: 'NUST Preference Generator | Optimize Your Choices',
  description: 'Generate an optimized NUST preference list based on your aggregate, interests, and admission chances. Smart recommendations for safe, moderate, and ambitious choices.',
  keywords: [
    'NUST preference list',
    'NUST admission preferences',
    'NUST program selection',
    'optimize NUST preferences',
    'NUST admission strategy',
  ],
  alternates: {
    canonical: '/preference-generator',
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

  const latestMeritData = sampleData.meritHistory.reduce((acc, m) => {
    const key = m.programId;
    if (!acc[key] || m.year > acc[key].year) {
      acc[key] = m;
    }
    return acc;
  }, {} as Record<string, typeof sampleData.meritHistory[0]>);

  return { programs, latestMeritData };
}

export default function PreferenceGeneratorPage() {
  const { programs, latestMeritData } = transformData();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Preference Order Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Build an optimized preference list based on your aggregate, interests, 
            and historical admission data. Get smart recommendations for your choices.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PreferenceGeneratorClient 
            programs={programs} 
            latestMeritData={latestMeritData} 
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            How to Use This Tool
          </h2>
          
          <div className="space-y-6 text-slate-400">
            <ol className="space-y-4 list-decimal list-inside">
              <li>
                <strong className="text-white">Enter your aggregate</strong> - 
                Calculate or enter your NUST aggregate percentage
              </li>
              <li>
                <strong className="text-white">Select programs you&apos;re interested in</strong> - 
                Choose from available programs across all campuses
              </li>
              <li>
                <strong className="text-white">Set your risk tolerance</strong> - 
                Choose between conservative, moderate, or aggressive strategies
              </li>
              <li>
                <strong className="text-white">Generate your list</strong> - 
                Get a ranked preference list with safe, moderate, and ambitious choices
              </li>
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="text-green-400 font-semibold mb-1">Safe Choices</div>
                <div className="text-sm">High chance of admission (70%+)</div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="text-amber-400 font-semibold mb-1">Moderate Choices</div>
                <div className="text-sm">Competitive chance (40-70%)</div>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="text-red-400 font-semibold mb-1">Ambitious Choices</div>
                <div className="text-sm">Reach programs (&lt;40%)</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-6">
              <p className="text-sm text-emerald-300">
                <strong>Pro Tip:</strong> A balanced preference list should include 
                a mix of safe, moderate, and ambitious choices. This maximizes your 
                chances while still allowing you to aim high.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

