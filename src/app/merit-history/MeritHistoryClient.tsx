'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for chart to avoid SSR issues
const MeritTrendChart = dynamic(() => import('@/components/charts/MeritTrendChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] card flex items-center justify-center">
      <div className="text-[var(--text-muted)]">Loading chart...</div>
    </div>
  ),
});

interface Program {
  id: string;
  name: string;
  code: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  degreeType: string;
  seats?: number | null;
}

interface MeritEntry {
  programId: string;
  year: number;
  meritListNumber: number | null;
  closingMeritPosition: number | null;
  closingAggregate: number | null;
  sourceName: string;
  notes?: string | null;
}

interface MeritHistoryClientProps {
  programs: Program[];
  meritHistory: MeritEntry[];
}

export default function MeritHistoryClient({ programs, meritHistory }: MeritHistoryClientProps) {
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Get unique values for filters
  const campuses = useMemo(() => [...new Set(programs.map(p => p.campus))].sort(), [programs]);
  const schools = useMemo(() => {
    const filtered = selectedCampus ? programs.filter(p => p.campus === selectedCampus) : programs;
    return [...new Set(filtered.map(p => p.school))].sort();
  }, [programs, selectedCampus]);
  const years = useMemo(() => [...new Set(meritHistory.map(m => m.year))].sort((a, b) => b - a), [meritHistory]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesCampus = !selectedCampus || p.campus === selectedCampus;
      const matchesSchool = !selectedSchool || p.school === selectedSchool;
      return matchesCampus && matchesSchool;
    });
  }, [programs, selectedCampus, selectedSchool]);

  // Get merit history for selected program
  const programMeritHistory = useMemo(() => {
    if (!selectedProgram) return [];
    return meritHistory
      .filter(m => m.programId === selectedProgram.id)
      .filter(m => !selectedYear || m.year === parseInt(selectedYear))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return (a.meritListNumber || 0) - (b.meritListNumber || 0);
      });
  }, [meritHistory, selectedProgram, selectedYear]);

  // Chart data
  const chartData = useMemo(() => {
    if (!selectedProgram) return [];
    return meritHistory
      .filter(m => m.programId === selectedProgram.id)
      .map(m => ({
        year: m.year,
        closingAggregate: m.closingAggregate,
        closingPosition: m.closingMeritPosition,
        meritListNumber: m.meritListNumber,
      }));
  }, [meritHistory, selectedProgram]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Filter Programs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="campus" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Campus
            </label>
            <select
              id="campus"
              value={selectedCampus}
              onChange={(e) => {
                setSelectedCampus(e.target.value);
                setSelectedSchool('');
                setSelectedProgram(null);
              }}
              className="input"
            >
              <option value="">All Campuses</option>
              {campuses.map(campus => (
                <option key={campus} value={campus}>{campus}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              School
            </label>
            <select
              id="school"
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setSelectedProgram(null);
              }}
              className="input"
            >
              <option value="">All Schools</option>
              {schools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Program Selection */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Select Program ({filteredPrograms.length} programs)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
          {filteredPrograms.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelectedProgram(program)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedProgram?.id === program.id
                  ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <p className="font-medium">{program.name}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {program.campus} • {program.school}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Program Details */}
      {selectedProgram && (
        <>
          {/* Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Merit Trend: {selectedProgram.name}
            </h2>
            <MeritTrendChart
              data={chartData}
              programName={selectedProgram.name}
              showAggregate={true}
              showPosition={false}
              height={350}
            />
          </div>

          {/* Merit Table */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Historical Data: {selectedProgram.name}
            </h2>
            
            {programMeritHistory.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                No merit history data available for this program.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">Year</th>
                      <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">Merit List</th>
                      <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">Closing Aggregate</th>
                      <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">Closing Position</th>
                      <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programMeritHistory.map((entry, index) => (
                      <tr 
                        key={`${entry.programId}-${entry.year}-${entry.meritListNumber}`}
                        className={`border-b border-[var(--border-color)] ${index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : ''}`}
                      >
                        <td className="py-3 px-4 text-[var(--text-primary)] font-medium">{entry.year}</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {entry.meritListNumber ? `${entry.meritListNumber}${getOrdinalSuffix(entry.meritListNumber)} List` : 'Final'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-[var(--success)]">
                            {entry.closingAggregate?.toFixed(2) ?? '-'}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[var(--warning)]">
                          {entry.closingMeritPosition ?? '-'}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)] text-sm">
                          {entry.sourceName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Program Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Program Details</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <dt className="text-[var(--text-muted)] text-sm mb-1">Program Code</dt>
                <dd className="text-[var(--text-primary)] font-medium">{selectedProgram.code}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] text-sm mb-1">Campus</dt>
                <dd className="text-[var(--text-primary)] font-medium">{selectedProgram.campus}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] text-sm mb-1">School</dt>
                <dd className="text-[var(--text-primary)] font-medium">{selectedProgram.school}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)] text-sm mb-1">Seats</dt>
                <dd className="text-[var(--text-primary)] font-medium">{selectedProgram.seats ?? 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </>
      )}

      {/* No Program Selected */}
      {!selectedProgram && (
        <div className="text-center py-16">
          <div className="text-[var(--text-muted)] mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)]">Select a program above to view its merit history</p>
        </div>
      )}
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
