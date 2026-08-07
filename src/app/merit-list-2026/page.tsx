import type { Metadata } from 'next';
import Link from 'next/link';
import sampleData from '@/data/sampleMeritData.json';
import {
  MERIT_LIST_CATEGORIES,
  NET_POOL_LABEL,
  SEPARATELY_NUMBERED_PROGRAMS,
  meritListCategoryFor,
  netPoolFor,
} from '@/lib/meritData';
import MeritList2026Client, { type MeritRow } from './MeritList2026Client';

const YEAR = 2026;
const LIST_NUMBER = 1;

export const metadata: Metadata = {
  title: 'NUST Merit List 2026 (1st Merit List) — Closing Positions, All Programs',
  description:
    'The complete NUST 2026 1st merit list: closing merit positions for every program at SEECS, SMME, CEME, NBS, S3H, PNEC, NBC, MCS, CAE and more, with last year\'s position for comparison. Search and filter in one table.',
  keywords: [
    'NUST merit list 2026',
    'NUST 1st merit list 2026',
    'NUST closing merit 2026',
    'NUST merit position 2026',
    'NUST SEECS merit 2026',
    'NUST engineering merit list 2026',
    'NUST merit list all programs',
  ],
  alternates: {
    canonical: '/merit-list-2026',
  },
};

function buildRows(): MeritRow[] {
  const current = sampleData.meritHistory.filter(
    m => m.year === YEAR && m.meritListNumber === LIST_NUMBER
  );

  return current.flatMap((entry): MeritRow[] => {
    const program = sampleData.programs.find(p => p.id === entry.programId);
    if (!program) return [];

    const previous = sampleData.meritHistory.find(
      m =>
        m.programId === program.id && m.year === YEAR - 1 && m.meritListNumber === LIST_NUMBER
    );

    return [
      {
        id: program.id,
        name: program.name,
        school: program.school,
        campus: program.campus,
        category: meritListCategoryFor(program.id, program.disciplineGroup),
        netPool: NET_POOL_LABEL[netPoolFor(program.disciplineGroup, program.school)],
        separatelyNumbered: SEPARATELY_NUMBERED_PROGRAMS.has(program.id),
        position: entry.closingMeritPosition,
        aggregate: entry.closingAggregate,
        previousPosition: previous?.closingMeritPosition ?? null,
      },
    ];
  });
}

export default function MeritList2026Page() {
  const rows = buildRows();
  const awaitingAggregates = rows.every(r => r.aggregate === null);

  // Order the category filter the way the published list is ordered, dropping
  // any heading nothing has been published under yet.
  const categories = MERIT_LIST_CATEGORIES.filter(c => rows.some(r => r.category === c));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wide mb-4">
            1st merit list
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            NUST Merit List {YEAR}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto">
            Closing merit position on the {YEAR} 1st merit list for all {rows.length} programs,
            with the same list from {YEAR - 1} beside it.
            {awaitingAggregates
              ? ' NUST has not published the closing aggregates for this list yet.'
              : ''}
          </p>
        </div>
      </section>

      {/* The list */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MeritList2026Client rows={rows} categories={[...categories]} year={YEAR} />
        </div>
      </section>

      {/* How to read it */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            How to read the {YEAR} merit list
          </h2>

          <div className="space-y-6 text-[var(--text-secondary)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm">
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">
                  Closing position, not a cutoff percentage
                </h3>
                <p className="text-sm">
                  The number is the merit position of the last candidate called in that program on
                  the 1st list. If your position in the merit list is lower than that number, you
                  were within this list.
                </p>
              </div>
              <div className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm">
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">
                  Positions are numbered per NET
                </h3>
                <p className="text-sm">
                  NUST ranks each candidate inside their NET pool, so an Engineering position and a
                  Business position are separate numbering systems. Only compare programs that
                  share a NET — the NET column tells you which.
                </p>
              </div>
            </div>

            <p>
              Later lists always run deeper than the 1st. A program you missed on this list can
              still call you on the 2nd, 3rd or a later one, so use the{' '}
              <Link href="/merit-history" className="text-[var(--accent-primary)] underline">
                merit history
              </Link>{' '}
              to see how far each program fell across previous years&apos; lists, and the{' '}
              <Link href="/position-estimator" className="text-[var(--accent-primary)] underline">
                position estimator
              </Link>{' '}
              to work out where your own aggregate lands.
            </p>

            {awaitingAggregates && (
              <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)] rounded-xl">
                <p className="text-sm text-[var(--warning)]">
                  <strong>Aggregates pending:</strong> NUST publishes closing positions for a list
                  before the aggregates behind them. Until those land, the aggregate column shows{' '}
                  <span className="font-mono">—</span>. Always verify against the official NUST
                  merit list before acting on any figure here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
