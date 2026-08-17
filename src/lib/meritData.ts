/**
 * Shared accessors over the merit dataset.
 *
 * NUST publishes a cycle's closing merit positions well before it publishes the
 * aggregates behind them, so the newest year in the dataset can legitimately be
 * position-only (every 2026 list so far is). Anything that reasons about closing
 * aggregates therefore has to work from the newest year that actually carries
 * them — reading "the latest year" literally would quietly empty every
 * prediction the moment a position-only list lands.
 */

import sampleData from '@/data/sampleMeritData.json';

export type MeritEntry = (typeof sampleData.meritHistory)[number];

/** Only the rows whose closing aggregate NUST has published. */
export const meritEntriesWithAggregate: MeritEntry[] = sampleData.meritHistory.filter(
  m => m.closingAggregate !== null
);

/** Newest year with a published aggregate, keyed by program id. */
export function latestAggregateYearByProgram(): Record<string, number> {
  const latest: Record<string, number> = {};
  for (const m of meritEntriesWithAggregate) {
    if (!latest[m.programId] || m.year > latest[m.programId]) {
      latest[m.programId] = m.year;
    }
  }
  return latest;
}

/** Every numbered list published for a cycle, oldest first. */
export function publishedListNumbers(year: number): number[] {
  const lists = new Set<number>();
  for (const m of sampleData.meritHistory) {
    if (m.year === year && m.meritListNumber !== null) lists.add(m.meritListNumber);
  }
  return [...lists].sort((a, b) => a - b);
}

// ============================================
// NET pools
// ============================================

/** The five NET papers NUST ranks candidates within. */
export type NetPool =
  | 'engineering'
  | 'business'
  | 'applied-sciences'
  | 'architecture'
  | 'natural-sciences';

export const NET_POOL_LABEL: Record<NetPool, string> = {
  engineering: 'Engineering',
  business: 'Business',
  'applied-sciences': 'Applied Sciences',
  architecture: 'Architecture',
  'natural-sciences': 'Natural Sciences',
};

/**
 * Which NET pool a program ranks in. Merit positions are numbered within the
 * pool, not within the program, so two programs only have comparable positions
 * when this returns the same value for both.
 */
export function netPoolFor(disciplineGroup: string, school: string): NetPool {
  // Business schools
  if (school === 'NBS' || school === 'S3H' || school === 'JSPPL' || school === 'NLS') {
    return 'business';
  }

  // Architecture
  if (school === 'SADA') {
    return 'architecture';
  }

  // Applied Sciences (Pre-Medical based)
  if (disciplineGroup === 'Applied Sciences' || school === 'ASAB') {
    return 'applied-sciences';
  }

  // Natural Sciences (SNS)
  if (school === 'SNS') {
    return 'natural-sciences';
  }

  // Default: Engineering & Computing
  return 'engineering';
}

/**
 * Programs that publish their own separately-numbered merit list rather than
 * ranking within the shared NET pool. LLB closes around #100-#264 and
 * Bioinformatics around #60-#383 while the rest of their NET is in the
 * thousands at the same aggregate, so their positions cannot be read against
 * their pool's.
 */
export const SEPARATELY_NUMBERED_PROGRAMS = new Set(['nls-llb', 'sines-bsbi']);

// ============================================
// Published merit-list categories
// ============================================

/**
 * The headings NUST publishes its merit lists under, in order. These are a
 * presentation grouping and deliberately differ from `disciplineGroup` (which
 * drives NET pooling): the published list files BS AI under Computing while its
 * candidates sit the Engineering NET, and files the BE computing degrees under
 * Engineering.
 */
export const MERIT_LIST_CATEGORIES = [
  'Computing',
  'Engineering',
  'Management & Social Sciences',
  'Architecture & Industrial Design',
  'Applied Sciences',
  'Natural Sciences',
] as const;

export type MeritListCategory = (typeof MERIT_LIST_CATEGORIES)[number];

/** Programs the published list files differently to their disciplineGroup. */
const CATEGORY_OVERRIDES: Record<string, MeritListCategory> = {
  'seecs-ai': 'Computing',
  'nbc-ai': 'Computing',
  'seecs-se': 'Engineering',
  'seecs-ce': 'Engineering',
  'ceme-ce': 'Engineering',
  'mcs-se': 'Engineering',
  'mcs-is': 'Engineering',
  'sines-bsbi': 'Computing',
};

export function meritListCategoryFor(
  programId: string,
  disciplineGroup: string
): MeritListCategory {
  const override = CATEGORY_OVERRIDES[programId];
  if (override) return override;

  switch (disciplineGroup) {
    case 'Computing':
      return 'Computing';
    case 'Business':
    case 'Social Sciences':
    case 'Law':
      return 'Management & Social Sciences';
    case 'Architecture':
      return 'Architecture & Industrial Design';
    case 'Applied Sciences':
      return 'Applied Sciences';
    case 'Natural Sciences':
      return 'Natural Sciences';
    default:
      return 'Engineering';
  }
}
