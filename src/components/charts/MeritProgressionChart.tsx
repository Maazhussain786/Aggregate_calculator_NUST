'use client';

import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type Chart,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useVizTokens, tooltipStyle, CHART_FONT } from './vizTokens';
import { ordinal } from '@/lib/ordinal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export interface ProgressionEntry {
  year: number;
  meritListNumber: number | null;
  closingAggregate: number | null;
  closingMeritPosition: number | null;
}

interface Props {
  entries: ProgressionEntry[];
  /**
   * Every admission year in the dataset, ascending. Colour is keyed off this
   * rather than off the years this one program happens to have, so 2025 is the
   * same hue whether or not the program also has 2024 data.
   */
  yearOrder: number[];
  height?: number;
}

type Metric = 'aggregate' | 'position';

/**
 * Draws the value beside each line's last point, but only when the endpoints
 * are far enough apart to stay attached to their own line. Converging lines
 * fall back to the legend and tooltip rather than stacked labels.
 *
 * Options here must stay plain data — Chart.js resolves function-valued plugin
 * options as *scriptable* options and calls them with its own context, so a
 * formatter passed through options would never receive the value.
 */
const endLabelPlugin = {
  id: 'meritEndLabels',
  afterDatasetsDraw(chart: Chart) {
    const opts = (chart.options.plugins as Record<string, unknown> | undefined)?.meritEndLabels as
      | { color?: string; metric?: Metric }
      | undefined;
    if (!opts?.metric) return;

    const format = (v: number) =>
      opts.metric === 'aggregate' ? `${v.toFixed(2)}%` : v.toLocaleString();

    const tips: { x: number; y: number; text: string }[] = [];
    chart.data.datasets.forEach((_, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden) return;
      for (let p = meta.data.length - 1; p >= 0; p--) {
        const value = chart.data.datasets[i].data[p];
        if (typeof value !== 'number') continue;
        tips.push({ x: meta.data[p].x, y: meta.data[p].y, text: format(value) });
        break;
      }
    });

    // Skip labelling entirely if any pair would collide — never stack them.
    const MIN_GAP = 16;
    for (let a = 0; a < tips.length; a++) {
      for (let b = a + 1; b < tips.length; b++) {
        if (Math.abs(tips[a].y - tips[b].y) < MIN_GAP) return;
      }
    }

    const { ctx } = chart;
    ctx.save();
    ctx.font = `600 12px ${CHART_FONT}`;
    ctx.fillStyle = opts.color ?? '#000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    tips.forEach((t) => ctx.fillText(t.text, t.x, t.y - 10));
    ctx.restore();
  },
};

ChartJS.register(endLabelPlugin);

export default function MeritProgressionChart({ entries, yearOrder, height = 340 }: Props) {
  const t = useVizTokens();
  const [metric, setMetric] = useState<Metric>('aggregate');

  const years = useMemo(
    () => [...new Set(entries.map((e) => e.year))].sort((a, b) => a - b),
    [entries]
  );

  /**
   * The x-axis is the stages of a cycle, taken from whatever has actually been
   * published rather than a fixed 1st/3rd/Final — a running cycle adds a list
   * at a time, and each one has to appear as it lands. The Final list always
   * closes the axis.
   */
  const stages = useMemo(() => {
    const numbered = [
      ...new Set(
        entries
          .map((e) => e.meritListNumber)
          .filter((n): n is number => n !== null)
      ),
    ].sort((a, b) => a - b);

    return [
      ...numbered.map((key) => ({ key: key as number | null, label: `${ordinal(key)} list` })),
      ...(entries.some((e) => e.meritListNumber === null)
        ? [{ key: null as number | null, label: 'Final list' }]
        : []),
    ];
  }, [entries]);

  const chartData = useMemo(() => {
    const datasets = years.flatMap((year) => {
      const slot = Math.max(0, yearOrder.indexOf(year));
      const colour = t.series[slot % t.series.length];
      const data = stages.map(({ key }) => {
        const hit = entries.find((e) => e.year === year && e.meritListNumber === key);
        if (!hit) return null;
        return metric === 'aggregate' ? hit.closingAggregate : hit.closingMeritPosition;
      });

      // A year with nothing to plot for this metric — 2026 publishes positions
      // before aggregates — would otherwise sit in the legend drawing nothing.
      if (data.every((v) => v === null)) return [];

      return [{
        label: String(year),
        data,
        borderColor: colour,
        backgroundColor: colour,
        borderWidth: 2,
        tension: 0,
        spanGaps: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: colour,
        pointBorderColor: t.surface,
        pointBorderWidth: 2,
        pointHitRadius: 20,
      }];
    });

    return { labels: stages.map((s) => s.label), datasets };
  }, [entries, years, stages, yearOrder, metric, t]);

  const seriesCount = chartData.datasets.length;

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      // Top padding leaves room for the end-of-line value labels.
      layout: { padding: { right: 12, top: 24 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: seriesCount > 1,
          position: 'top',
          align: 'end',
          labels: {
            color: t.textSecondary,
            font: { family: CHART_FONT, size: 12 },
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            padding: 16,
          },
        },
        tooltip: {
          ...tooltipStyle(t),
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v === null) return `${ctx.dataset.label}: no data`;
              return metric === 'aggregate'
                ? `${ctx.dataset.label}: ${v.toFixed(2)}%`
                : `${ctx.dataset.label}: position ${v.toLocaleString()}`;
            },
          },
        },
        meritEndLabels: { color: t.textPrimary, metric },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: t.axis },
          ticks: {
            color: t.textMuted,
            font: { family: CHART_FONT, size: 12 },
          },
        },
        y: {
          grid: { color: t.grid },
          border: { display: false },
          ticks: {
            color: t.textMuted,
            font: { family: CHART_FONT, size: 11 },
            callback: (value) =>
              metric === 'aggregate' ? `${value}%` : Number(value).toLocaleString(),
          },
          title: {
            display: true,
            text: metric === 'aggregate' ? 'Closing aggregate' : 'Closing merit position',
            color: t.textMuted,
            font: { family: CHART_FONT, size: 11 },
          },
        },
      },
    }),
    [t, metric, seriesCount]
  );

  return (
    <div>
      <div className="flex justify-end mb-3">
        <div
          role="group"
          aria-label="Chart metric"
          className="inline-flex rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-input)]"
        >
          {([
            ['aggregate', 'Aggregate %'],
            ['position', 'Merit position'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMetric(value)}
              aria-pressed={metric === value}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                metric === value
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* The toggle stays available even with nothing to draw, so a metric the
          program has no data for is never a dead end. */}
      <div style={{ height }}>
        {seriesCount === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-[var(--text-muted)] px-4">
            {metric === 'aggregate'
              ? 'No closing aggregates published for this program yet.'
              : 'No merit positions published for this program yet.'}
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
