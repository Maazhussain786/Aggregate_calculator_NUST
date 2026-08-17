import type { Metadata } from 'next';
import Link from 'next/link';
import sampleData from '@/data/sampleMeritData.json';
import {
  MERIT_LIST_CATEGORIES,
  NET_POOL_LABEL,
  SEPARATELY_NUMBERED_PROGRAMS,
  meritListCategoryFor,
  netPoolFor,
  publishedListNumbers,
} from '@/lib/meritData';
import { listSeries, ordinal } from '@/lib/ordinal';
import MeritList2026Client, { type ListView, type MeritRow } from './MeritList2026Client';

const YEAR = 2026;

/**
 * The cycle gains a list every few weeks, so nothing here names one. Everything
 * — the copy, the metadata, which list opens by default — is derived from
 * whatever the dataset holds, and publishing the next list is a data-only edit.
 */
const LISTS = publishedListNumbers(YEAR);
const LATEST_LIST = LISTS[LISTS.length - 1];
const EARLIER_LISTS = LISTS.slice(0, -1);

export const metadata: Metadata = {
  title: `NUST Merit List 2026 (${ordinal(LATEST_LIST)} Merit List) — Closing Positions, All Programs`,
  description:
    `The complete NUST 2026 ${ordinal(LATEST_LIST)} merit list: closing merit positions for every program at SEECS, ` +
    'SMME, CEME, NBS, S3H, PNEC, NBC, MCS, CAE and more, with the earlier lists beside it. ' +
    'Search and filter in one table.',
  keywords: [
    'NUST merit list 2026',
    `NUST ${ordinal(LATEST_LIST)} merit list 2026`,
    ...LISTS.slice(0, -1).map(n => `NUST ${ordinal(n)} merit list 2026`),
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

/**
 * A list is read against whatever came immediately before it: the previous list
 * of this cycle once there is one, and otherwise the same list a year earlier.
 * Both answer "how much further down did it reach", just over different spans.
 */
function baselineFor(listNumber: number) {
  const previousInCycle = LISTS.filter(n => n < listNumber).pop();
  return previousInCycle !== undefined
    ? {
        label: `${ordinal(previousInCycle)} list`,
        caption: `the ${ordinal(previousInCycle)} list of this cycle`,
        find: (programId: string) =>
          sampleData.meritHistory.find(
            m =>
              m.programId === programId &&
              m.year === YEAR &&
              m.meritListNumber === previousInCycle
          ),
      }
    : {
        label: `${YEAR - 1} position`,
        caption: `the same list in ${YEAR - 1}`,
        find: (programId: string) =>
          sampleData.meritHistory.find(
            m =>
              m.programId === programId &&
              m.year === YEAR - 1 &&
              m.meritListNumber === listNumber
          ),
      };
}

function buildView(listNumber: number): ListView {
  const baseline = baselineFor(listNumber);

  const rows = sampleData.meritHistory
    .filter(m => m.year === YEAR && m.meritListNumber === listNumber)
    .flatMap((entry): MeritRow[] => {
      const program = sampleData.programs.find(p => p.id === entry.programId);
      if (!program) return [];

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
          baselinePosition: baseline.find(program.id)?.closingMeritPosition ?? null,
        },
      ];
    });

  return {
    listNumber,
    label: `${ordinal(listNumber)} list`,
    baselineLabel: baseline.label,
    baselineCaption: baseline.caption,
    rows,
  };
}

export default function MeritList2026Page() {
  const views = LISTS.map(buildView);
  const latest = views[views.length - 1];
  const awaitingAggregates = latest.rows.every(r => r.aggregate === null);

  // Order the category filter the way the published list is ordered, dropping
  // any heading nothing has been published under yet.
  const categories = MERIT_LIST_CATEGORIES.filter(c => latest.rows.some(r => r.category === c));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wide mb-4">
            {ordinal(LATEST_LIST)} merit list is out
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            NUST Merit List {YEAR}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto">
            {`Closing merit position on the ${YEAR} ${ordinal(LATEST_LIST)} merit list for all ` +
              `${latest.rows.length} programs` +
              (EARLIER_LISTS.length
                ? `, and how far it moved past the ${listSeries(EARLIER_LISTS)}.`
                : '.') +
              (awaitingAggregates
                ? ' NUST has not published the closing aggregates for this list yet.'
                : '')}
          </p>
        </div>
      </section>

      {/* The list */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MeritList2026Client views={views} categories={[...categories]} year={YEAR} />
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
                  that list. If your position in the merit list is lower than that number, you were
                  within the list.
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
              Every list runs deeper than the one before it. A program that did not call you on the{' '}
              {ordinal(LATEST_LIST)} list can still call you on the{' '}
              {ordinal(LATEST_LIST + 1)} or a later one, so use the{' '}
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
