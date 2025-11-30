'use client';

import { type MeritListPredictionResult } from '@/lib/meritListPredictor';

interface MeritListDisplayProps {
  prediction: MeritListPredictionResult;
  programName: string;
}

export default function MeritListDisplay({ prediction, programName }: MeritListDisplayProps) {
  const getListColor = (listNumber: number | null) => {
    if (listNumber === null) return 'var(--text-muted)';
    if (listNumber <= 2) return 'var(--success)';
    if (listNumber <= 4) return 'var(--accent-primary)';
    if (listNumber <= 6) return 'var(--warning)';
    return 'var(--error)';
  };

  const getOrdinal = (n: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Merit List Prediction</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">{programName}</p>

      {/* Main Display */}
      <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl">
        {prediction.predictedList !== null ? (
          <>
            <div 
              className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full"
              style={{ backgroundColor: getListColor(prediction.predictedList) }}
            >
              <div className="text-white">
                <div className="text-2xl sm:text-3xl font-bold">{getOrdinal(prediction.predictedList)}</div>
                <div className="text-xs opacity-80">Merit List</div>
              </div>
            </div>
            <div 
              className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: `color-mix(in srgb, ${getListColor(prediction.predictedList)} 15%, transparent)`,
                color: getListColor(prediction.predictedList)
              }}
            >
              {prediction.confidence} Confidence
            </div>
          </>
        ) : (
          <div className="p-6 bg-[var(--error-light)] rounded-lg">
            <p className="text-[var(--error)] font-medium">Selection Unlikely</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Based on historical data, admission through merit lists is unlikely.
            </p>
          </div>
        )}
      </div>

      {/* Merit List Timeline */}
      {prediction.predictedList !== null && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Merit List Timeline</h4>
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((listNum) => (
              <div
                key={listNum}
                className={`flex-1 h-8 sm:h-10 rounded-md flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  listNum === prediction.predictedList
                    ? 'text-white shadow-md'
                    : prediction.alternatives.includes(listNum)
                    ? 'border-2 border-dashed'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}
                style={{
                  backgroundColor: listNum === prediction.predictedList ? getListColor(listNum) : undefined,
                  borderColor: prediction.alternatives.includes(listNum) ? getListColor(listNum) : undefined,
                  color: prediction.alternatives.includes(listNum) ? getListColor(listNum) : undefined,
                }}
              >
                {listNum}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>Earlier</span>
            <span>Later</span>
          </div>
        </div>
      )}

      {/* Alternatives */}
      {prediction.alternatives.length > 0 && (
        <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Alternative Possibilities</h4>
          <p className="text-sm text-[var(--text-secondary)]">
            You might also get selected in the{' '}
            {prediction.alternatives.map((alt, i) => (
              <span key={alt}>
                <strong className="text-[var(--text-primary)]">{getOrdinal(alt)}</strong>
                {i < prediction.alternatives.length - 1 ? ' or ' : ''}
              </span>
            ))}{' '}
            merit list.
          </p>
        </div>
      )}

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Analysis</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {prediction.explanation}
        </p>
      </div>

      {/* Estimate Warning */}
      {prediction.isEstimate && (
        <div className="mt-4 p-4 bg-[var(--warning-light)] rounded-lg">
          <p className="text-sm text-[var(--warning)]">
            <strong>Note:</strong> This prediction is based on estimated thresholds. 
            Results may vary when real historical data is available.
          </p>
        </div>
      )}
    </div>
  );
}
