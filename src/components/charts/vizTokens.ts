'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

/**
 * Chart tokens for the merit visualisations.
 *
 * The series hues are NOT the app's teal accent: teal falls below the chroma
 * floor for chart marks (it reads gray next to a neutral) and the two-series
 * pairs built from it fail colour-blind separation. These four slots were
 * validated against the light card (#ffffff) and dark card (#1a3030) surfaces
 * for lightness band, chroma floor, CVD separation, normal-vision separation
 * and 3:1 contrast.
 *
 * Slots are handed out by ASCENDING year, so adding a new admission year
 * appends a colour instead of repainting the years already on screen.
 */
const SERIES_LIGHT = ['#2a78d6', '#eb6834', '#4a3aa7', '#008300'];
const SERIES_DARK = ['#3987e5', '#d95926', '#9085e9', '#1fa81f'];

export interface VizTokens {
  isDark: boolean;
  surface: string;
  grid: string;
  axis: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** De-emphasis fill for "context" marks in an emphasis chart. */
  deemphasis: string;
  /** Zebra banding for long ranked rows, so a label traces to its own mark. */
  band: string;
  /** The one highlighted mark in an emphasis chart. */
  emphasis: string;
  series: string[];
}

const LIGHT: VizTokens = {
  isDark: false,
  surface: '#ffffff',
  grid: '#e4eded',
  axis: '#c1d5d4',
  textPrimary: '#0f1f1f',
  textSecondary: '#1e3333',
  textMuted: '#4a6565',
  deemphasis: '#93aeae',
  band: 'rgba(15, 31, 31, 0.028)',
  emphasis: SERIES_LIGHT[0],
  series: SERIES_LIGHT,
};

const DARK: VizTokens = {
  isDark: true,
  surface: '#1a3030',
  grid: '#2d4a4a',
  axis: '#375858',
  textPrimary: '#f0f7f7',
  textSecondary: '#b8d4d3',
  textMuted: '#7fa8a7',
  deemphasis: '#6d8f8f',
  band: 'rgba(240, 247, 247, 0.035)',
  emphasis: SERIES_DARK[0],
  series: SERIES_DARK,
};

/**
 * Resolves chart tokens for the active theme. Returns the light set until the
 * component has mounted so the first client render matches the server HTML.
 */
export function useVizTokens(): VizTokens {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  return mounted && theme === 'dark' ? DARK : LIGHT;
}

/** Shared tooltip styling so every chart on the page reads the same. */
export function tooltipStyle(t: VizTokens) {
  return {
    backgroundColor: t.isDark ? '#0f1f1f' : '#ffffff',
    titleColor: t.textPrimary,
    bodyColor: t.textSecondary,
    borderColor: t.isDark ? '#375858' : '#c1d5d4',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 8,
    displayColors: true,
    boxWidth: 8,
    boxHeight: 8,
    usePointStyle: true,
    titleFont: { family: "'Inter', sans-serif", weight: 'bold' as const, size: 12 },
    bodyFont: { family: "'Inter', sans-serif", size: 12 },
  };
}

export const CHART_FONT = "'Inter', sans-serif";
