'use client';

import { useState, useCallback, useMemo } from 'react';
import { generateMeritHistoryPDF, type MeritListPage } from '@/lib/meritPdfGenerator';

interface YearData {
  year: number;
  lists: MeritListPage[];
}

interface MeritPdfDownloadProps {
  availableYears: YearData[];
}

const ALL_LIST_NUMBERS = ['1','2','3','4','5','6','7','8','9','10','11','Final'] as const;

export default function MeritPdfDownload({ availableYears }: MeritPdfDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]?.year ?? 2025);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());

  // Get the lists available for the selected year
  const currentYearData = useMemo(
    () => availableYears.find((y) => y.year === selectedYear),
    [availableYears, selectedYear],
  );
  const availableListNumbers = useMemo(
    () => currentYearData?.lists.map((l) => l.listNumber) ?? [],
    [currentYearData],
  );

  // Toggle a single list
  const toggleList = (ln: string) => {
    setSelectedLists((prev) => {
      const next = new Set(prev);
      if (next.has(ln)) next.delete(ln);
      else next.add(ln);
      return next;
    });
  };

  // Select / deselect all
  const selectAll = () => setSelectedLists(new Set(availableListNumbers));
  const deselectAll = () => setSelectedLists(new Set());

  // Quick-select presets
  const selectKeyLists = () => setSelectedLists(new Set(['1', '3', 'Final'].filter((l) => availableListNumbers.includes(l))));

  const handleDownload = useCallback(async () => {
    if (isGenerating || selectedLists.size === 0 || !currentYearData) return;
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 80));
      const filtered = currentYearData.lists.filter((l) => selectedLists.has(l.listNumber));
      await generateMeritHistoryPDF(filtered, selectedYear);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, selectedLists, currentYearData, selectedYear]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl
          bg-[var(--accent-primary)] text-[var(--text-inverse)] font-semibold
          shadow-md hover:shadow-lg transition-all duration-200
          hover:brightness-110 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Merit History (PDF)</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-3 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg animate-fade-in">
          {/* Year Selector */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              Select Year
            </label>
            <div className="flex gap-2 flex-wrap">
              {availableYears.map(({ year }) => (
                <button
                  key={year}
                  onClick={() => { setSelectedYear(year); setSelectedLists(new Set()); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border
                    ${selectedYear === year
                      ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Merit List Checkboxes */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                Select Merit Lists
              </label>
              <div className="flex gap-2 text-xs">
                <button onClick={selectAll}
                  className="px-2.5 py-1 rounded-md bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium hover:brightness-95 transition-all">
                  All
                </button>
                <button onClick={selectKeyLists}
                  className="px-2.5 py-1 rounded-md bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium hover:brightness-95 transition-all">
                  1st, 3rd & Final
                </button>
                <button onClick={deselectAll}
                  className="px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-muted)] font-medium hover:text-[var(--text-primary)] transition-all">
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {ALL_LIST_NUMBERS.map((ln) => {
                const available = availableListNumbers.includes(ln);
                const checked = selectedLists.has(ln);
                return (
                  <label
                    key={ln}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium
                      border cursor-pointer transition-all select-none
                      ${!available
                        ? 'opacity-30 cursor-not-allowed border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)]'
                        : checked
                          ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)] border-[var(--accent-primary)] shadow-sm'
                          : 'bg-[var(--bg-input)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!available}
                      onChange={() => available && toggleList(ln)}
                      className="sr-only"
                    />
                    {ln === 'Final' ? 'Final' : `List ${ln}`}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Selected count & Download */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-muted)]">
              {selectedLists.size === 0
                ? 'No lists selected'
                : `${selectedLists.size} list${selectedLists.size > 1 ? 's' : ''} selected — ${selectedLists.size} page${selectedLists.size > 1 ? 's' : ''} in PDF`}
            </p>
            <button
              onClick={handleDownload}
              disabled={isGenerating || selectedLists.size === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                bg-[var(--accent-primary)] text-[var(--text-inverse)] font-semibold text-sm
                shadow-md hover:shadow-lg transition-all duration-200
                hover:brightness-110 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
