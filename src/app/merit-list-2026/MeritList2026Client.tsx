'use client';

import { useMemo, useState } from 'react';

export interface MeritRow {
  id: string;
  name: string;
  school: string;
  campus: string;
  category: string;
  netPool: string;
  /** Ranked on its own list rather than inside its NET pool. */
  separatelyNumbered: boolean;
  position: number | null;
  aggregate: number | null;
  previousPosition: number | null;
}

interface Props {
  rows: MeritRow[];
  /** Published categories, in the order NUST lists them. */
  categories: string[];
  year: number;
}

type SortKey = 'position' | 'name';

/**
 * A deeper closing position means the list reached further down the merit
 * order, which is the good outcome for an applicant — so it reads the same way
 * a falling aggregate cutoff does.
 */
function Change({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) {
    return <span className="text-[var(--text-muted)]">same</span>;
  }
  const deeper = delta > 0;
  return (
    <span className={deeper ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>
      {deeper ? '▼' : '▲'} {Math.abs(delta).toLocaleString()}
    </span>
  );
}

export default function MeritList2026Client({ rows, categories, year }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<SortKey>('position');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      if (category && r.category !== category) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.school.toLowerCase().includes(q) ||
        r.campus.toLowerCase().includes(q) ||
        r.netPool.toLowerCase().includes(q)
      );
    });
  }, [rows, query, category]);

  // Grouped by published category so positions sit next to the ones they can
  // actually be read against.
  const groups = useMemo(() => {
    const order = category ? [category] : categories;
    return order
      .map(name => ({
        name,
        rows: filtered
          .filter(r => r.category === name)
          .sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            return (a.position ?? Infinity) - (b.position ?? Infinity);
          }),
      }))
      .filter(g => g.rows.length > 0);
  }, [filtered, categories, category, sort]);

  const hasFootnote = filtered.some(r => r.separatelyNumbered);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 md:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <label htmlFor="program-search" className="sr-only">
              Search programs
            </label>
            <input
              id="program-search"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a program, school or campus — e.g. SEECS, civil, Karachi"
              className="input"
            />
          </div>

          <div
            role="group"
            aria-label="Sort order"
            className="inline-flex rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-input)] self-start"
          >
            {(
              [
                ['position', 'By position'],
                ['name', 'A–Z'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                aria-pressed={sort === value}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                  sort === value
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ label: `All programs (${rows.length})`, value: '' }, ...categories.map(c => ({
            label: `${c} (${rows.filter(r => r.category === c).length})`,
            value: c,
          }))].map(option => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => setCategory(option.value)}
              aria-pressed={category === option.value}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                category === option.value
                  ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white font-medium'
                  : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* The list */}
      {groups.length === 0 ? (
        <div className="card p-10 text-center text-[var(--text-muted)]">
          No program matches “{query}”.
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Columns drop out below md, so the minimum only needs to grow
                back as they reappear */}
            <table className="w-full min-w-[380px] sm:min-w-[560px] md:min-w-[720px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-sm">
                    Program
                  </th>
                  <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium text-sm hidden md:table-cell">
                    NET
                  </th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm whitespace-nowrap">
                    {year} position
                  </th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm whitespace-nowrap">
                    {year} aggregate
                  </th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm whitespace-nowrap hidden sm:table-cell">
                    {year - 1} position
                  </th>
                  <th className="text-right py-3 px-4 text-[var(--text-secondary)] font-medium text-sm whitespace-nowrap">
                    Change
                  </th>
                </tr>
              </thead>

              {groups.map(group => (
                <tbody key={group.name}>
                  <tr>
                    <th
                      colSpan={6}
                      scope="colgroup"
                      className="text-left py-2.5 px-4 bg-[var(--accent-light)] text-[var(--accent-primary)] text-xs font-semibold uppercase tracking-wide border-y border-[var(--border-color)]"
                    >
                      {group.name}
                      <span className="ml-2 font-normal normal-case tracking-normal opacity-80">
                        {group.rows.length} programs
                      </span>
                    </th>
                  </tr>

                  {group.rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-b border-[var(--border-color)] ${
                        index % 2 === 0 ? '' : 'bg-[var(--bg-secondary)]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <p className="text-[var(--text-primary)] font-medium">
                          {row.name}
                          {row.separatelyNumbered && (
                            <sup className="ml-0.5 text-[var(--accent-primary)]">*</sup>
                          )}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {row.school} • {row.campus}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-[var(--text-secondary)] hidden md:table-cell whitespace-nowrap">
                        {row.netPool}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[var(--warning)]">
                        {row.position?.toLocaleString() ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {row.aggregate !== null ? (
                          <span className="text-[var(--success)]">
                            {row.aggregate.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]" title="Not published by NUST yet">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--text-secondary)] hidden sm:table-cell">
                        {row.previousPosition?.toLocaleString() ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm whitespace-nowrap">
                        {row.position !== null && row.previousPosition !== null ? (
                          <Change current={row.position} previous={row.previousPosition} />
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-[var(--text-muted)] space-y-1 px-1">
        <p>
          <span className="text-[var(--success)]">▼</span> means the list ran deeper than {year - 1}
          , calling more candidates. <span className="text-[var(--warning)]">▲</span> means it
          closed earlier. Positions are only comparable within the same NET.
        </p>
        {hasFootnote && (
          <p>
            <span className="text-[var(--accent-primary)]">*</span> Ranked on its own separately
            numbered list rather than inside its NET pool.
          </p>
        )}
      </div>
    </div>
  );
}
