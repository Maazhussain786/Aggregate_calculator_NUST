'use client';

import { type PredictionResult } from '@/lib/chancePredictor';

interface ChanceDisplayProps {
  prediction: PredictionResult;
  programName: string;
}

export default function ChanceDisplay({ prediction, programName }: ChanceDisplayProps) {
  const getChanceColor = (percentage: number) => {
    if (percentage >= 70) return 'var(--success)';
    if (percentage >= 40) return 'var(--warning)';
    return 'var(--error)';
  };

  const getChanceBgColor = (percentage: number) => {
    if (percentage >= 70) return 'var(--success-light)';
    if (percentage >= 40) return 'var(--warning-light)';
    return 'var(--error-light)';
  };

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Admission Chances</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6">{programName}</p>

      {/* Main Chance Display */}
      <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl">
        <div 
          className="text-5xl sm:text-6xl font-bold mono"
          style={{ color: getChanceColor(prediction.chancePercentage) }}
        >
          {prediction.chancePercentage}%
        </div>
        <div 
          className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: getChanceBgColor(prediction.chancePercentage),
            color: getChanceColor(prediction.chancePercentage)
          }}
        >
          {prediction.category}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${prediction.chancePercentage}%`,
              backgroundColor: getChanceColor(prediction.chancePercentage)
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Analysis</h4>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {prediction.explanation}
        </p>
      </div>

      {/* Metadata */}
      {prediction.metadata.dataAvailable && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-muted)] mb-1">Your Aggregate</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mono">
              {prediction.metadata.userAggregate.toFixed(2)}%
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-muted)] mb-1">Last Year Closing</p>
            <p className="text-lg font-bold text-[var(--text-primary)] mono">
              {prediction.metadata.lastYearClosingAggregate?.toFixed(2) ?? 'N/A'}%
            </p>
          </div>
        </div>
      )}

      {/* Tips */}
      {prediction.tips.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {prediction.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
