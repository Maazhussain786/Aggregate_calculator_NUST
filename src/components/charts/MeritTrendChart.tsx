'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/components/ThemeProvider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MeritDataPoint {
  year: number;
  closingAggregate?: number | null;
  closingPosition?: number | null;
  meritListNumber?: number | null;
}

interface MeritTrendChartProps {
  data: MeritDataPoint[];
  programName: string;
  showAggregate?: boolean;
  showPosition?: boolean;
  height?: number;
}

export default function MeritTrendChart({
  data,
  programName,
  showAggregate = true,
  showPosition = false,
  height = 300,
}: MeritTrendChartProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted ? theme === 'dark' : false;

  const processedData = useMemo(() => {
    const filtered = data
      .filter(d => !d.meritListNumber || d.meritListNumber === 1)
      .sort((a, b) => a.year - b.year);
    
    return {
      labels: filtered.map(d => d.year.toString()),
      aggregates: filtered.map(d => d.closingAggregate ?? null),
      positions: filtered.map(d => d.closingPosition ?? null),
    };
  }, [data]);

  const chartData = useMemo(() => {
    const datasets = [];

    if (showAggregate) {
      datasets.push({
        label: 'Closing Aggregate (%)',
        data: processedData.aggregates,
        borderColor: isDark ? '#60a5fa' : '#1e40af',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(30, 64, 175, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? '#60a5fa' : '#1e40af',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
      });
    }

    if (showPosition) {
      datasets.push({
        label: 'Closing Position',
        data: processedData.positions,
        borderColor: isDark ? '#fbbf24' : '#d97706',
        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(217, 119, 6, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: isDark ? '#fbbf24' : '#d97706',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
        yAxisID: showAggregate ? 'y1' : 'y',
      });
    }

    return {
      labels: processedData.labels,
      datasets,
    };
  }, [processedData, showAggregate, showPosition, isDark]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: `Merit Trend: ${programName}`,
        color: isDark ? '#f8fafc' : '#0f172a',
        font: {
          size: 14,
          weight: 'bold' as const,
          family: "'Inter', sans-serif",
        },
        padding: {
          bottom: 16,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        position: 'left' as const,
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          callback: function(value: number | string) {
            return showAggregate ? `${value}%` : value;
          },
        },
        title: {
          display: true,
          text: showAggregate ? 'Closing Aggregate (%)' : 'Merit Position',
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
      ...(showAggregate && showPosition ? {
        y1: {
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: isDark ? '#fbbf24' : '#d97706',
            font: {
              family: "'Inter', sans-serif",
              size: 11,
            },
          },
          title: {
            display: true,
            text: 'Merit Position',
            color: isDark ? '#fbbf24' : '#d97706',
            font: {
              family: "'Inter', sans-serif",
              size: 11,
            },
          },
        },
      } : {}),
    },
  }), [programName, showAggregate, showPosition, isDark]);

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center card"
        style={{ height }}
      >
        <p className="text-[var(--text-muted)]">No historical data available</p>
      </div>
    );
  }

  return (
    <div 
      className="card p-4"
      style={{ height }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
}
