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

/** The three lists NUST data is published for, in the order a cycle runs. */
const STAGES: { key: number | null; label: string }[] = [
  { key: 1, label: '1st list' },
  { key: 3, label: '3rd list' },
  { key: null, label: 'Final list' },
];

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

  const chartData = useMemo(() => {
    const datasets = years.map((year) => {
      const slot = Math.max(0, yearOrder.indexOf(year));
      const colour = t.series[slot % t.series.length];
      const data = STAGES.map(({ key }) => {
        const hit = entries.find((e) => e.year === year && e.meritListNumber === key);
        if (!hit) return null;
        return metric === 'aggregate' ? hit.closingAggregate : hit.closingMeritPosition;
      });

      return {
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
      };
    });

    return { labels: STAGES.map((s) => s.label), datasets };
  }, [entries, years, yearOrder, metric, t]);

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      // Top padding leaves room for the end-of-line value labels.
      layout: { padding: { right: 12, top: 24 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: years.length > 1,
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
    [t, metric, years.length]
  );

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center text-[var(--text-muted)]" style={{ height }}>
        No historical data available for this program.
      </div>
    );
  }

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
      <div style={{ height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
