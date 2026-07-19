'use client';

import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type Chart,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useVizTokens, tooltipStyle, CHART_FONT } from './vizTokens';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export interface PeerRow {
  id: string;
  name: string;
  school: string;
  campus: string;
  aggregate: number;
}

/**
 * Eight program names repeat across NUST campuses ("BE Electrical Engineering"
 * exists four times), so a bare name would put identical labels on different
 * rows. Qualify only the ones that actually collide.
 */
function labelRows(rows: PeerRow[]): string[] {
  const nameCount = new Map<string, number>();
  rows.forEach((r) => nameCount.set(r.name, (nameCount.get(r.name) ?? 0) + 1));

  const withSchool = rows.map((r) =>
    (nameCount.get(r.name) ?? 0) > 1 ? `${r.name} · ${r.school}` : r.name
  );

  const qualifiedCount = new Map<string, number>();
  withSchool.forEach((l) => qualifiedCount.set(l, (qualifiedCount.get(l) ?? 0) + 1));

  return withSchool.map((label, i) =>
    (qualifiedCount.get(label) ?? 0) > 1 ? `${label}, ${rows[i].campus}` : label
  );
}

interface Props {
  /** Programs in the same school as the selection, including it. */
  schoolRows: PeerRow[];
  /** Every program with data for the year. */
  allRows: PeerRow[];
  selectedId: string;
  schoolName: string;
  year: number;
}

/** Vertical hairline marking the median of the plotted set. */
const medianLinePlugin = {
  id: 'medianLine',
  beforeDatasetsDraw(chart: Chart) {
    const opts = (chart.options.plugins as Record<string, unknown> | undefined)?.medianLine as
      | { value?: number; color?: string; label?: string; labelColor?: string }
      | undefined;
    if (!opts?.value) return;

    const x = chart.scales.x.getPixelForValue(opts.value);
    const { top, bottom } = chart.chartArea;
    const { ctx } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = opts.color ?? '#ccc';
    ctx.stroke();

    // Label sits below the plot: the value axis runs along the top, so
    // anything drawn above chartArea would collide with its tick labels.
    if (opts.label) {
      ctx.font = `500 11px ${CHART_FONT}`;
      ctx.fillStyle = opts.labelColor ?? '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(opts.label, x, bottom + 6);
    }
    ctx.restore();
  },
};

ChartJS.register(medianLinePlugin);

/** Zebra rows so a long list of labels traces cleanly to its own dot. */
const rowBandPlugin = {
  id: 'rowBands',
  beforeDatasetsDraw(chart: Chart) {
    const opts = (chart.options.plugins as Record<string, unknown> | undefined)?.rowBands as
      | { color?: string; rows?: number }
      | undefined;
    if (!opts?.rows || !opts.color) return;

    const { top, bottom, left, right } = chart.chartArea;
    const rowHeight = (bottom - top) / opts.rows;
    const { ctx } = chart;

    ctx.save();
    ctx.fillStyle = opts.color;
    for (let i = 0; i < opts.rows; i += 2) {
      ctx.fillRect(left, top + i * rowHeight, right - left, rowHeight);
    }
    ctx.restore();
  },
};

ChartJS.register(rowBandPlugin);

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default function PeerComparisonChart({
  schoolRows,
  allRows,
  selectedId,
  schoolName,
  year,
}: Props) {
  const t = useVizTokens();
  const [scope, setScope] = useState<'school' | 'all'>(
    schoolRows.length >= 3 ? 'school' : 'all'
  );
  const [showTable, setShowTable] = useState(false);

  const rows = useMemo(() => {
    const source = scope === 'school' ? schoolRows : allRows;
    return [...source].sort((a, b) => b.aggregate - a.aggregate);
  }, [scope, schoolRows, allRows]);

  const selectedRank = rows.findIndex((r) => r.id === selectedId) + 1;
  const med = useMemo(() => (rows.length ? median(rows.map((r) => r.aggregate)) : 0), [rows]);

  const chartData = useMemo(
    () => ({
      labels: labelRows(rows),
      datasets: [
        {
          label: `Final closing aggregate ${year}`,
          data: rows.map((r) => r.aggregate),
          showLine: false,
          pointRadius: rows.map((r) => (r.id === selectedId ? 7 : 4.5)),
          pointHoverRadius: rows.map((r) => (r.id === selectedId ? 9 : 6.5)),
          pointBackgroundColor: rows.map((r) =>
            r.id === selectedId ? t.emphasis : t.deemphasis
          ),
          pointBorderColor: t.surface,
          pointBorderWidth: 2,
          pointHitRadius: 24,
        },
      ],
    }),
    [rows, selectedId, t, year]
  );

  const options = useMemo<ChartOptions<'line'>>(() => {
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, right: 16, bottom: 22 } },
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipStyle(t),
          callbacks: {
            title: (items) => items[0].label,
            label: (ctx) => {
              const rank = ctx.dataIndex + 1;
              const value = ctx.parsed.x ?? rows[ctx.dataIndex]?.aggregate ?? 0;
              return `${value.toFixed(2)}%  ·  #${rank} of ${rows.length}`;
            },
          },
        },
        medianLine: {
          value: med,
          color: t.axis,
          label: `median ${med.toFixed(1)}%`,
          labelColor: t.textMuted,
        },
        rowBands: { color: t.band, rows: rows.length },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'top',
          // `grace` pads the data range while letting Chart.js keep round
          // ticks — pinning min/max to the raw extremes produced "26%".
          grace: '6%',
          grid: { color: t.grid },
          border: { display: false },
          ticks: {
            color: t.textMuted,
            font: { family: CHART_FONT, size: 11 },
            maxTicksLimit: 8,
            callback: (v) => `${Number(v).toFixed(0)}%`,
          },
        },
        y: {
          type: 'category',
          grid: { display: false },
          border: { color: t.axis },
          ticks: {
            autoSkip: false,
            font: { family: CHART_FONT, size: 11 },
            color: (ctx) =>
              rows[ctx.index]?.id === selectedId ? t.textPrimary : t.textMuted,
          },
        },
      },
    };
  }, [rows, med, selectedId, t]);

  if (rows.length < 2) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {selectedRank > 0 ? (
            <>
              <span className="font-semibold text-[var(--text-primary)]">
                #{selectedRank} of {rows.length}
              </span>{' '}
              most competitive{scope === 'school' ? ` in ${schoolName}` : ' across NUST'}
            </>
          ) : (
            <>Final closing aggregates, {year}</>
          )}
        </p>

        <div
          role="group"
          aria-label="Comparison scope"
          className="inline-flex rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-input)]"
        >
          {([
            ['school', schoolName],
            ['all', 'All NUST'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              aria-pressed={scope === value}
              disabled={value === 'school' && schoolRows.length < 2}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-40 ${
                scope === value
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: Math.max(200, rows.length * 26 + 60) }}>
        <Line data={chartData} options={options} />
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 text-sm text-[var(--accent-primary)] hover:underline"
        aria-expanded={showTable}
      >
        {showTable ? 'Hide values' : 'Show all values as a table'}
      </button>

      {showTable && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-2 pr-4 font-medium text-[var(--text-secondary)]">#</th>
                <th className="text-left py-2 pr-4 font-medium text-[var(--text-secondary)]">
                  Program
                </th>
                <th className="text-right py-2 font-medium text-[var(--text-secondary)]">
                  Final closing aggregate {year}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-[var(--border-color)] ${
                    r.id === selectedId ? 'bg-[var(--accent-light)]' : ''
                  }`}
                >
                  <td className="py-2 pr-4 text-[var(--text-muted)] tabular-nums">{i + 1}</td>
                  <td
                    className={`py-2 pr-4 ${
                      r.id === selectedId
                        ? 'font-semibold text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {r.name}
                  </td>
                  <td className="py-2 text-right tabular-nums text-[var(--text-primary)]">
                    {r.aggregate.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
