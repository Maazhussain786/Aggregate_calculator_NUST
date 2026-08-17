'use client';

import { useMemo } from 'react';

export interface StatEntry {
  year: number;
  meritListNumber: number | null;
  closingAggregate: number | null;
  closingMeritPosition: number | null;
}

interface Props {
  entries: StatEntry[];
  /** 1-based rank of this program by latest final closing aggregate, across NUST. */
  nustRank?: number;
  nustTotal?: number;
}

function find(entries: StatEntry[], year: number, list: number | null) {
  return entries.find((e) => e.year === year && e.meritListNumber === list);
}

/** A rising cutoff is bad news for an applicant, so "up" is never styled as good. */
function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.005) {
    return (
      <span className="text-xs text-[var(--text-muted)]">unchanged vs last year</span>
    );
  }
  const harder = delta > 0;
  return (
    <span
      className={`text-xs font-medium ${
        harder ? 'text-[var(--warning)]' : 'text-[var(--success)]'
      }`}
    >
      {harder ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} pts {harder ? 'harder' : 'easier'} vs
      last year
    </span>
  );
}

function Tile({
  label,
  value,
  foot,
}: {
  label: string;
  value: string;
  foot?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[var(--text-primary)] leading-tight">{value}</p>
      {foot && <p className="mt-1.5">{foot}</p>}
    </div>
  );
}

export default function MeritStatTiles({ entries, nustRank, nustTotal }: Props) {
  const stats = useMemo(() => {
    // Anchor on the newest cycle that has actually finished. A cycle still in
    // progress (2026, several lists in but with no final one) has no final
    // cutoff to report, and reading it as "latest" would blank out every tile.
    const years = [
      ...new Set(entries.filter((e) => e.meritListNumber === null).map((e) => e.year)),
    ].sort((a, b) => b - a);
    const latest = years[0];
    const prior = years[1];
    if (latest === undefined) return null;

    const finalNow = find(entries, latest, null);
    const firstNow = find(entries, latest, 1);
    const finalPrev = prior !== undefined ? find(entries, prior, null) : undefined;
    const firstPrev = prior !== undefined ? find(entries, prior, 1) : undefined;

    return { latest, prior, finalNow, firstNow, finalPrev, firstPrev };
  }, [entries]);

  if (!stats || !stats.finalNow) return null;

  const { latest, finalNow, firstNow, finalPrev, firstPrev } = stats;

  const finalAgg = finalNow.closingAggregate;
  const firstAgg = firstNow?.closingAggregate ?? null;
  const drop = finalAgg !== null && firstAgg !== null ? firstAgg - finalAgg : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Tile
        label={`Final list cutoff (${latest})`}
        value={finalAgg !== null ? `${finalAgg.toFixed(2)}%` : '—'}
        foot={
          finalAgg !== null && finalPrev?.closingAggregate != null ? (
            <DeltaBadge delta={finalAgg - finalPrev.closingAggregate} />
          ) : (
            <span className="text-xs text-[var(--text-muted)]">lowest aggregate admitted</span>
          )
        }
      />

      <Tile
        label={`1st list cutoff (${latest})`}
        value={firstAgg !== null ? `${firstAgg.toFixed(2)}%` : '—'}
        foot={
          firstAgg !== null && firstPrev?.closingAggregate != null ? (
            <DeltaBadge delta={firstAgg - firstPrev.closingAggregate} />
          ) : (
            <span className="text-xs text-[var(--text-muted)]">day-one requirement</span>
          )
        }
      />

      <Tile
        label="Merit drop, 1st → final"
        value={drop !== null ? `${drop.toFixed(2)} pts` : '—'}
        foot={
          <span className="text-xs text-[var(--text-muted)]">
            how much waiting for later lists is worth
          </span>
        }
      />

      <Tile
        label={nustRank ? 'Competitiveness' : `Positions filled (${latest})`}
        value={
          nustRank && nustTotal
            ? `#${nustRank}`
            : finalNow.closingMeritPosition !== null
              ? finalNow.closingMeritPosition.toLocaleString()
              : '—'
        }
        foot={
          <span className="text-xs text-[var(--text-muted)]">
            {nustRank && nustTotal
              ? `hardest of ${nustTotal} NUST programs`
              : 'last merit position admitted'}
          </span>
        }
      />
    </div>
  );
}
