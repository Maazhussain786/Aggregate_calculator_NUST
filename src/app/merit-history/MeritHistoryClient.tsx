'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { PeerRow } from '@/components/charts/PeerComparisonChart';

// Dynamic imports for charts to avoid SSR issues
function chartLoader(height: number) {
  const ChartLoading = () => (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="text-[var(--text-muted)]">Loading chart...</div>
    </div>
  );
  return ChartLoading;
}

const MeritProgressionChart = dynamic(
  () => import('@/components/charts/MeritProgressionChart'),
  { ssr: false, loading: chartLoader(340) }
);

const PeerComparisonChart = dynamic(
  () => import('@/components/charts/PeerComparisonChart'),
  { ssr: false, loading: chartLoader(400) }
);

const MeritStatTiles = dynamic(() => import('@/components/charts/MeritStatTiles'), {
  ssr: false,
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
  const resultsRef = useRef<HTMLDivElement>(null);
  
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

  // Get merit history for selected program - filter to show only 1st, 3rd, and Final lists
  const programMeritHistory = useMemo(() => {
    if (!selectedProgram) return [];
    return meritHistory
      .filter(m => m.programId === selectedProgram.id)
      .filter(m => !selectedYear || m.year === parseInt(selectedYear))
      // Filter to only show 1st, 3rd, and Final lists
      .filter(m => m.meritListNumber === 1 || m.meritListNumber === 3 || m.meritListNumber === null)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        // Sort: 1st, 3rd, Final (null)
        const getOrder = (num: number | null) => num === null ? 999 : num;
        return getOrder(a.meritListNumber) - getOrder(b.meritListNumber);
      });
  }, [meritHistory, selectedProgram, selectedYear]);

  // The newest cycle in the dataset, and whether NUST has published its
  // aggregates yet. A fresh cycle ships closing positions first, so the site
  // has to be able to show a year that is position-only.
  const latestYear = useMemo(
    () => (meritHistory.length ? Math.max(...meritHistory.map(m => m.year)) : null),
    [meritHistory]
  );

  const latestCycle = useMemo(() => {
    if (latestYear === null) return null;
    const rows = meritHistory.filter(m => m.year === latestYear);
    const lists = [...new Set(rows.map(r => r.meritListNumber))];
    return {
      year: latestYear,
      // Only the 1st list so far means the cycle is still running.
      isOngoing: !lists.includes(null),
      awaitingAggregates: rows.every(r => r.closingAggregate === null),
      programCount: new Set(rows.map(r => r.programId)).size,
      listLabel: lists.includes(null)
        ? 'Final list'
        : `${Math.min(...(lists.filter((l): l is number => l !== null)))}${getOrdinalSuffix(
            Math.min(...(lists.filter((l): l is number => l !== null)))
          )} merit list`,
    };
  }, [meritHistory, latestYear]);

  // The selected program's row in that newest cycle, plus the same list a year
  // earlier so the two closing positions can be compared directly.
  const latestCycleRow = useMemo(() => {
    if (!selectedProgram || latestYear === null) return null;
    const rows = meritHistory.filter(
      m => m.programId === selectedProgram.id && m.year === latestYear
    );
    if (rows.length === 0) return null;
    // Newest cycle, earliest list published for it.
    const current = [...rows].sort(
      (a, b) => (a.meritListNumber ?? 999) - (b.meritListNumber ?? 999)
    )[0];
    const previous = meritHistory.find(
      m =>
        m.programId === selectedProgram.id &&
        m.year === latestYear - 1 &&
        m.meritListNumber === current.meritListNumber
    );
    return { current, previous: previous ?? null };
  }, [meritHistory, selectedProgram, latestYear]);

  // Every published list for this program, scoped by the year filter.
  const programEntries = useMemo(() => {
    if (!selectedProgram) return [];
    return meritHistory
      .filter(m => m.programId === selectedProgram.id)
      .filter(m => !selectedYear || m.year === parseInt(selectedYear));
  }, [meritHistory, selectedProgram, selectedYear]);

  // The most recent year that has a final list, used for the peer comparison.
  const comparisonYear = useMemo(() => {
    const withFinal = meritHistory.filter(
      m => m.meritListNumber === null && m.closingAggregate !== null
    );
    const candidates = selectedYear
      ? withFinal.filter(m => m.year === parseInt(selectedYear))
      : withFinal;
    return candidates.length ? Math.max(...candidates.map(m => m.year)) : null;
  }, [meritHistory, selectedYear]);

  // Final closing aggregate per program for the comparison year.
  const peerRows = useMemo(() => {
    if (comparisonYear === null) return [];
    return meritHistory
      .filter(
        m =>
          m.year === comparisonYear &&
          m.meritListNumber === null &&
          m.closingAggregate !== null
      )
      .map(m => {
        const program = programs.find(p => p.id === m.programId);
        return program
          ? {
              id: program.id,
              name: program.name,
              school: program.school,
              campus: program.campus,
              aggregate: m.closingAggregate as number,
            }
          : null;
      })
      .filter((r): r is PeerRow => r !== null);
  }, [meritHistory, programs, comparisonYear]);

  const schoolPeerRows = useMemo(
    () => (selectedProgram ? peerRows.filter(r => r.school === selectedProgram.school) : []),
    [peerRows, selectedProgram]
  );

  // Rank across all of NUST by the comparison year's final closing aggregate.
  const nustRank = useMemo(() => {
    if (!selectedProgram) return undefined;
    const sorted = [...peerRows].sort((a, b) => b.aggregate - a.aggregate);
    const index = sorted.findIndex(r => r.id === selectedProgram.id);
    return index === -1 ? undefined : index + 1;
  }, [peerRows, selectedProgram]);

  // Auto-scroll to results when a program is selected
  useEffect(() => {
    if (selectedProgram && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedProgram]);

  return (
    <div className="space-y-6">
      {/* Newest cycle announcement */}
      {latestCycle?.isOngoing && (
        <div className="rounded-xl border border-[var(--accent-primary)] bg-[var(--accent-light)] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-[var(--accent-primary)] text-white text-xs font-semibold tracking-wide uppercase">
              New
            </span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {latestCycle.year} {latestCycle.listLabel} is out
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Closing merit positions for {latestCycle.programCount} programs are published.{' '}
            {latestCycle.awaitingAggregates && (
              <>
                NUST has not released the matching closing aggregates for this list yet, so those
                columns show <span className="font-mono">—</span> until it does.
              </>
            )}
          </p>
          <Link
            href="/merit-list-2026"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[var(--accent-primary)] hover:opacity-80"
          >
            See all {latestCycle.programCount} programs in one list
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

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
        <div ref={resultsRef} className="space-y-6">
          {/* Newest cycle spotlight — a running cycle sits above the archive so
              it is not buried under years of finished data */}
          {latestCycle?.isOngoing &&
            latestCycleRow &&
            latestCycleRow.current.year === latestCycle.year &&
            (!selectedYear || parseInt(selectedYear) === latestCycle.year) && (
              // .card sets its own border, so the accent has to be applied inline to win
              <div className="card p-6" style={{ borderColor: 'var(--accent-primary)' }}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-semibold">
                    {latestCycle.year}
                  </span>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {latestCycleRow.current.meritListNumber
                      ? `${latestCycleRow.current.meritListNumber}${getOrdinalSuffix(
                          latestCycleRow.current.meritListNumber
                        )} merit list`
                      : 'Final merit list'}
                  </h2>
                  <span className="text-sm text-[var(--text-muted)]">
                    {selectedProgram.name} • {selectedProgram.school}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Closing merit position</p>
                    <p className="text-3xl font-semibold font-mono text-[var(--warning)] leading-tight">
                      {latestCycleRow.current.closingMeritPosition?.toLocaleString() ?? '—'}
                    </p>
                    <p className="mt-1.5">
                      {latestCycleRow.current.closingMeritPosition !== null &&
                      latestCycleRow.previous?.closingMeritPosition != null ? (
                        <PositionDelta
                          current={latestCycleRow.current.closingMeritPosition}
                          previous={latestCycleRow.previous.closingMeritPosition}
                          previousYear={latestCycleRow.previous.year}
                        />
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">
                          last position called on this list
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Closing aggregate</p>
                    <p className="text-3xl font-semibold font-mono text-[var(--text-muted)] leading-tight">
                      {latestCycleRow.current.closingAggregate !== null
                        ? `${latestCycleRow.current.closingAggregate.toFixed(2)}%`
                        : '—'}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                      {latestCycleRow.current.closingAggregate !== null
                        ? 'lowest aggregate called'
                        : 'not published by NUST yet'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">
                      Same list, {latestCycle.year - 1}
                    </p>
                    <p className="text-3xl font-semibold font-mono text-[var(--text-secondary)] leading-tight">
                      {latestCycleRow.previous?.closingMeritPosition?.toLocaleString() ?? '—'}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                      {latestCycleRow.previous
                        ? `position at the same stage of ${latestCycle.year - 1}`
                        : `no ${latestCycle.year - 1} data for this list`}
                    </p>
                  </div>
                </div>

                {latestCycleRow.current.closingAggregate === null && (
                  <p className="text-sm text-[var(--text-muted)] mt-4">
                    Positions on this list are official. The aggregate behind the cutoff follows
                    once NUST publishes it — until then, compare positions rather than percentages.
                  </p>
                )}
              </div>
            )}

          {/* Merit Table — the published figures come first */}
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
                        <td className="py-3 px-4 text-[var(--text-primary)] font-medium">
                          <span className="inline-flex items-center gap-2">
                            {entry.year}
                            {latestCycle?.isOngoing && entry.year === latestCycle.year && (
                              <span className="px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] text-[10px] font-semibold uppercase tracking-wide">
                                New
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {entry.meritListNumber ? `${entry.meritListNumber}${getOrdinalSuffix(entry.meritListNumber)} List` : 'Final'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {/* A list can be published before its aggregate is */}
                          {entry.closingAggregate !== null ? (
                            <span className="font-mono text-[var(--success)]">
                              {entry.closingAggregate.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="font-mono text-[var(--text-muted)]" title="Not published by NUST yet">
                              —
                            </span>
                          )}
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

          {/* Headline numbers */}
          <MeritStatTiles
            entries={programEntries}
            nustRank={nustRank}
            nustTotal={peerRows.length}
          />

          {/* How far merit falls across the lists */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              How far merit falls across the lists
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1 mb-2">
              Cutoffs drop with every list NUST publishes. Each line is one admission year, so
              you can see both how deep the lists went and whether the program got harder
              year over year.
            </p>
            <MeritProgressionChart
              entries={programEntries}
              yearOrder={[...years].sort((a, b) => a - b)}
              height={340}
            />
          </div>

          {/* Where this program sits against its peers — only meaningful when
              this program is itself in the comparison year's final figures */}
          {peerRows.length > 1 &&
            comparisonYear !== null &&
            peerRows.some(r => r.id === selectedProgram.id) && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Where {selectedProgram.name} sits against other programs
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">
                  Final closing aggregate for {comparisonYear}, ranked. This program is
                  highlighted; every other program is shown for context.
                </p>
                <PeerComparisonChart
                  schoolRows={schoolPeerRows}
                  allRows={peerRows}
                  selectedId={selectedProgram.id}
                  schoolName={selectedProgram.school}
                  year={comparisonYear}
                />
              </div>
            )}

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
            
            {/* Note for non-SEECS schools about seat numbers */}
            {selectedProgram.school !== 'SEECS' && (
              <div className="mt-4 p-3 bg-[var(--warning-light)] border border-[var(--warning)] rounded-lg">
                <p className="text-sm text-[var(--warning)]">
                  <strong>Note:</strong> The number of seats for this program may vary. If you have accurate seat information, please{' '}
                  <a href="/contact" className="underline font-medium hover:opacity-80">contact us</a> to help improve our data.
                </p>
              </div>
            )}
          </div>
        </div>
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

/**
 * Compares two closing merit positions from the same list stage. A larger
 * number means the list reached further down the merit order, which is the
 * good outcome for an applicant — so "deeper" is styled the same way a falling
 * aggregate cutoff is.
 */
function PositionDelta({
  current,
  previous,
  previousYear,
}: {
  current: number;
  previous: number;
  previousYear: number;
}) {
  const delta = current - previous;
  if (delta === 0) {
    return (
      <span className="text-xs text-[var(--text-muted)]">
        exactly where it closed in {previousYear}
      </span>
    );
  }
  const deeper = delta > 0;
  return (
    <span
      className={`text-xs font-medium ${
        deeper ? 'text-[var(--success)]' : 'text-[var(--warning)]'
      }`}
    >
      {deeper ? '▼' : '▲'} {Math.abs(delta).toLocaleString()}{' '}
      {deeper ? 'positions deeper than' : 'positions tighter than'} {previousYear}
    </span>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
