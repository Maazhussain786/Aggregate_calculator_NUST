'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { calculateAggregate, validateAggregateInput, type AggregateInput, type AggregateBreakdown } from '@/lib/calcAggregate';

interface AggregateFormProps {
  onResult?: (result: AggregateBreakdown) => void;
  showResults?: boolean;
}

type InputMode = 'percentage' | 'marks';
type FscTotalMarks = '550' | '1100' | 'custom';
type SscTotalMarks = '1100' | '1050' | 'custom';

export default function AggregateForm({ onResult, showResults = true }: AggregateFormProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  // Input mode: percentage or marks
  const [inputMode, setInputMode] = useState<InputMode>('marks');
  
  // FSc configuration
  const [fscTotalMarks, setFscTotalMarks] = useState<FscTotalMarks>('1100');
  const [customFscTotal, setCustomFscTotal] = useState<number>(1100);
  const [fscObtainedMarks, setFscObtainedMarks] = useState<number>(0);
  const [fscPercentage, setFscPercentage] = useState<number>(0);
  
  // SSC/Matric configuration
  const [sscTotalMarks, setSscTotalMarks] = useState<SscTotalMarks>('1100');
  const [customSscTotal, setCustomSscTotal] = useState<number>(1100);
  const [sscObtainedMarks, setSscObtainedMarks] = useState<number>(0);
  const [sscPercentage, setSscPercentage] = useState<number>(0);
  
  // NET Score
  const [netScore, setNetScore] = useState<number>(0);
  
  // O/A Level
  const [useEquivalence, setUseEquivalence] = useState<boolean>(false);
  const [hasALevelResult, setHasALevelResult] = useState<boolean>(true);
  const [equivalenceInputMode, setEquivalenceInputMode] = useState<InputMode>('marks');
  
  // A-Level marks (when has result)
  const [aLevelObtainedMarks, setALevelObtainedMarks] = useState<number>(0);
  const [aLevelTotalMarks, setALevelTotalMarks] = useState<number>(1100);
  const [aLevelPercentage, setALevelPercentage] = useState<number>(0);
  
  // O-Level marks
  const [oLevelObtainedMarks, setOLevelObtainedMarks] = useState<number>(0);
  const [oLevelTotalMarks, setOLevelTotalMarks] = useState<number>(1100);
  const [oLevelPercentage, setOLevelPercentage] = useState<number>(0);
  
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<AggregateBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate actual FSc total
  const actualFscTotal = useMemo(() => {
    if (fscTotalMarks === 'custom') return customFscTotal;
    return parseInt(fscTotalMarks);
  }, [fscTotalMarks, customFscTotal]);

  // Calculate actual SSC total
  const actualSscTotal = useMemo(() => {
    if (sscTotalMarks === 'custom') return customSscTotal;
    return parseInt(sscTotalMarks);
  }, [sscTotalMarks, customSscTotal]);

  // Calculate percentages from marks
  const calculatedFscPercentage = useMemo(() => {
    if (inputMode === 'percentage') return fscPercentage;
    if (actualFscTotal <= 0) return 0;
    return (fscObtainedMarks / actualFscTotal) * 100;
  }, [inputMode, fscPercentage, fscObtainedMarks, actualFscTotal]);

  const calculatedSscPercentage = useMemo(() => {
    if (inputMode === 'percentage') return sscPercentage;
    if (actualSscTotal <= 0) return 0;
    return (sscObtainedMarks / actualSscTotal) * 100;
  }, [inputMode, sscPercentage, sscObtainedMarks, actualSscTotal]);

  // Calculate A-Level percentage from marks
  const calculatedALevelPercentage = useMemo(() => {
    if (equivalenceInputMode === 'percentage') return aLevelPercentage;
    if (aLevelTotalMarks <= 0) return 0;
    return (aLevelObtainedMarks / aLevelTotalMarks) * 100;
  }, [equivalenceInputMode, aLevelPercentage, aLevelObtainedMarks, aLevelTotalMarks]);

  // Calculate O-Level percentage from marks
  const calculatedOLevelPercentage = useMemo(() => {
    if (equivalenceInputMode === 'percentage') return oLevelPercentage;
    if (oLevelTotalMarks <= 0) return 0;
    return (oLevelObtainedMarks / oLevelTotalMarks) * 100;
  }, [equivalenceInputMode, oLevelPercentage, oLevelObtainedMarks, oLevelTotalMarks]);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    setErrors([]);

    const formData: AggregateInput = {
      netScore,
      hscPercentage: calculatedFscPercentage,
      sscPercentage: calculatedSscPercentage,
      useEquivalence,
      hasALevelResult: useEquivalence ? hasALevelResult : undefined,
      aLevelPercentage: useEquivalence && hasALevelResult ? calculatedALevelPercentage : undefined,
      oLevelPercentage: useEquivalence ? calculatedOLevelPercentage : undefined,
    };

    // Validate input
    const validation = validateAggregateInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      setIsCalculating(false);
      return;
    }

    // Additional validation for marks mode
    if (!useEquivalence && inputMode === 'marks') {
      if (fscObtainedMarks > actualFscTotal) {
        setErrors(['FSc obtained marks cannot exceed total marks']);
        setIsCalculating(false);
        return;
      }
      if (sscObtainedMarks > actualSscTotal) {
        setErrors(['SSC/Matric obtained marks cannot exceed total marks']);
        setIsCalculating(false);
        return;
      }
    }

    if (useEquivalence && equivalenceInputMode === 'marks') {
      if (hasALevelResult && aLevelObtainedMarks > aLevelTotalMarks) {
        setErrors(['A-Level obtained marks cannot exceed total marks']);
        setIsCalculating(false);
        return;
      }
      if (oLevelObtainedMarks > oLevelTotalMarks) {
        setErrors(['O-Level obtained marks cannot exceed total marks']);
        setIsCalculating(false);
        return;
      }
    }

    // Calculate aggregate
    const calculatedResult = calculateAggregate(formData);
    setResult(calculatedResult);
    
    if (onResult) {
      onResult(calculatedResult);
    }
    
    setIsCalculating(false);
  }, [netScore, calculatedFscPercentage, calculatedSscPercentage, useEquivalence, hasALevelResult, calculatedALevelPercentage, calculatedOLevelPercentage, inputMode, fscObtainedMarks, actualFscTotal, sscObtainedMarks, actualSscTotal, equivalenceInputMode, aLevelObtainedMarks, aLevelTotalMarks, oLevelObtainedMarks, oLevelTotalMarks, onResult]);

  const handleReset = useCallback(() => {
    setNetScore(0);
    setFscObtainedMarks(0);
    setFscPercentage(0);
    setSscObtainedMarks(0);
    setSscPercentage(0);
    setALevelObtainedMarks(0);
    setALevelPercentage(0);
    setOLevelObtainedMarks(0);
    setOLevelPercentage(0);
    setResult(null);
    setErrors([]);
  }, []);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card p-6 md:p-8">
        <div className="space-y-6">
          {/* NET Score */}
          <div>
            <label htmlFor="netScore" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              NET Score
            </label>
            <div className="relative">
              <input
                type="number"
                id="netScore"
                min="0"
                max="200"
                value={netScore || ''}
                onChange={(e) => setNetScore(parseFloat(e.target.value) || 0)}
                placeholder="Enter your NET score (0-200)"
                className="input pr-16"
                aria-describedby="netScore-help"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-medium">/ 200</span>
            </div>
            <p id="netScore-help" className="mt-1.5 text-xs text-[var(--text-muted)]">
              NET exam score carries <strong>75%</strong> weight in your aggregate
            </p>
          </div>

          {/* Education System Toggle */}
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
              Education System
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUseEquivalence(false)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                  !useEquivalence
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                }`}
              >
                FSc / HSSC
              </button>
              <button
                type="button"
                onClick={() => setUseEquivalence(true)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                  useEquivalence
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                }`}
              >
                O/A Levels
              </button>
            </div>
          </div>

          {/* Show formula based on selection */}
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)] mb-2">Formula being used:</p>
            {useEquivalence ? (
              hasALevelResult ? (
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  <span className="text-[var(--accent-primary)]">NET × 75%</span>
                  <span className="text-[var(--text-muted)]"> + </span>
                  <span className="text-[var(--success)]">A-Level × 15%</span>
                  <span className="text-[var(--text-muted)]"> + </span>
                  <span className="text-[var(--warning)]">O-Level × 10%</span>
                </p>
              ) : (
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  <span className="text-[var(--accent-primary)]">NET × 75%</span>
                  <span className="text-[var(--text-muted)]"> + </span>
                  <span className="text-[var(--success)]">O-Level × 25%</span>
                </p>
              )
            ) : (
              <p className="text-sm font-medium text-[var(--text-primary)]">
                <span className="text-[var(--accent-primary)]">NET × 75%</span>
                <span className="text-[var(--text-muted)]"> + </span>
                <span className="text-[var(--success)]">FSc × 15%</span>
                <span className="text-[var(--text-muted)]"> + </span>
                <span className="text-[var(--warning)]">Matric × 10%</span>
              </p>
            )}
          </div>

          {useEquivalence ? (
            /* O/A Level Inputs */
            <div className="space-y-6">
              {/* Do you have A-Level Result? */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Do you have your A-Level Result?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setHasALevelResult(true)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      hasALevelResult
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasALevelResult(false)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      !hasALevelResult
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    No (Result Awaiting)
                  </button>
                </div>
              </div>

              {/* Input Mode Toggle */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Enter marks as
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEquivalenceInputMode('marks')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      equivalenceInputMode === 'marks'
                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    Marks
                  </button>
                  <button
                    type="button"
                    onClick={() => setEquivalenceInputMode('percentage')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      equivalenceInputMode === 'percentage'
                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              {/* A-Level Marks (only when has result) */}
              {hasALevelResult && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    A-Level Equivalence Marks
                  </label>
                  {equivalenceInputMode === 'marks' ? (
                    <>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Obtained Marks</label>
                          <input
                            type="number"
                            min="0"
                            max={aLevelTotalMarks}
                            value={aLevelObtainedMarks || ''}
                            onChange={(e) => setALevelObtainedMarks(parseFloat(e.target.value) || 0)}
                            placeholder="Obtained Marks"
                            className="input"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-[var(--text-muted)] mb-1.5">Total Marks</label>
                          <input
                            type="number"
                            min="1"
                            value={aLevelTotalMarks || ''}
                            onChange={(e) => setALevelTotalMarks(parseInt(e.target.value) || 0)}
                            placeholder="Total (e.g. 1100)"
                            className="input"
                          />
                        </div>
                      </div>
                      {aLevelObtainedMarks > 0 && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          Calculated: <span className="font-semibold text-[var(--accent-primary)]">{calculatedALevelPercentage.toFixed(2)}%</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={aLevelPercentage || ''}
                        onChange={(e) => setALevelPercentage(parseFloat(e.target.value) || 0)}
                        placeholder="Enter A-Level equivalence percentage"
                        className="input pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">
                    A-Level equivalence carries <strong>15%</strong> weight
                  </p>
                </div>
              )}

              {/* O-Level Marks (always shown for O/A Level) */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  O-Level Equivalence Marks
                </label>
                {equivalenceInputMode === 'marks' ? (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-[var(--text-muted)] mb-1.5">Obtained Marks</label>
                        <input
                          type="number"
                          min="0"
                          max={oLevelTotalMarks}
                          value={oLevelObtainedMarks || ''}
                          onChange={(e) => setOLevelObtainedMarks(parseFloat(e.target.value) || 0)}
                          placeholder="Obtained Marks"
                          className="input"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-[var(--text-muted)] mb-1.5">Total Marks</label>
                        <input
                          type="number"
                          min="1"
                          value={oLevelTotalMarks || ''}
                          onChange={(e) => setOLevelTotalMarks(parseInt(e.target.value) || 0)}
                          placeholder="Total (e.g. 1100)"
                          className="input"
                        />
                      </div>
                    </div>
                    {oLevelObtainedMarks > 0 && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Calculated: <span className="font-semibold text-[var(--accent-primary)]">{calculatedOLevelPercentage.toFixed(2)}%</span>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={oLevelPercentage || ''}
                      onChange={(e) => setOLevelPercentage(parseFloat(e.target.value) || 0)}
                      placeholder="Enter O-Level equivalence percentage"
                      className="input pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  O-Level equivalence carries <strong>{hasALevelResult ? '10%' : '25%'}</strong> weight
                  {!hasALevelResult && ' (since A-Level result is awaiting)'}
                </p>
              </div>
            </div>
          ) : (
            /* FSc Student Inputs */
            <>
              {/* Input Mode Toggle */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Enter marks as
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setInputMode('marks')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      inputMode === 'marks'
                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    Marks (Obtained / Total)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('percentage')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      inputMode === 'percentage'
                        ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>

              {/* FSc Input */}
              {inputMode === 'marks' ? (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    FSc / HSSC Marks
                  </label>
                  
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">Select your total marks:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFscTotalMarks('550')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          fscTotalMarks === '550'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        550 (11th only)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFscTotalMarks('1100')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          fscTotalMarks === '1100'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        1100 (Both Years)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFscTotalMarks('custom')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          fscTotalMarks === 'custom'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {fscTotalMarks === 'custom' && (
                    <input
                      type="number"
                      min="1"
                      value={customFscTotal || ''}
                      onChange={(e) => setCustomFscTotal(parseInt(e.target.value) || 0)}
                      placeholder="Enter total marks"
                      className="input"
                    />
                  )}

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={actualFscTotal}
                      value={fscObtainedMarks || ''}
                      onChange={(e) => setFscObtainedMarks(parseFloat(e.target.value) || 0)}
                      placeholder="Enter obtained marks"
                      className="input pr-20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">/ {actualFscTotal}</span>
                  </div>

                  {fscObtainedMarks > 0 && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Calculated: <span className="font-semibold text-[var(--accent-primary)]">{calculatedFscPercentage.toFixed(2)}%</span>
                    </p>
                  )}
                  
                  <p className="text-xs text-[var(--text-muted)]">
                    FSc/HSSC marks carry <strong>15%</strong> weight
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="fscPercentage" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    FSc / HSSC Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="fscPercentage"
                      min="0"
                      max="100"
                      step="0.01"
                      value={fscPercentage || ''}
                      onChange={(e) => setFscPercentage(parseFloat(e.target.value) || 0)}
                      placeholder="Enter percentage"
                      className="input pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    FSc/HSSC marks carry <strong>15%</strong> weight
                  </p>
                </div>
              )}

              {/* SSC/Matric Input */}
              {inputMode === 'marks' ? (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-[var(--text-primary)]">
                    SSC / Matric Marks
                  </label>
                  
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">Select your total marks:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSscTotalMarks('1100')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          sscTotalMarks === '1100'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        1100
                      </button>
                      <button
                        type="button"
                        onClick={() => setSscTotalMarks('1050')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          sscTotalMarks === '1050'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        1050
                      </button>
                      <button
                        type="button"
                        onClick={() => setSscTotalMarks('custom')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          sscTotalMarks === 'custom'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]'
                            : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {sscTotalMarks === 'custom' && (
                    <input
                      type="number"
                      min="1"
                      value={customSscTotal || ''}
                      onChange={(e) => setCustomSscTotal(parseInt(e.target.value) || 0)}
                      placeholder="Enter total marks"
                      className="input"
                    />
                  )}

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={actualSscTotal}
                      value={sscObtainedMarks || ''}
                      onChange={(e) => setSscObtainedMarks(parseFloat(e.target.value) || 0)}
                      placeholder="Enter obtained marks"
                      className="input pr-20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">/ {actualSscTotal}</span>
                  </div>

                  {sscObtainedMarks > 0 && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Calculated: <span className="font-semibold text-[var(--accent-primary)]">{calculatedSscPercentage.toFixed(2)}%</span>
                    </p>
                  )}
                  
                  <p className="text-xs text-[var(--text-muted)]">
                    SSC/Matric marks carry <strong>10%</strong> weight
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="sscPercentage" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    SSC / Matric Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="sscPercentage"
                      min="0"
                      max="100"
                      step="0.01"
                      value={sscPercentage || ''}
                      onChange={(e) => setSscPercentage(parseFloat(e.target.value) || 0)}
                      placeholder="Enter percentage"
                      className="input pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">%</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    SSC/Matric marks carry <strong>10%</strong> weight
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mt-6 p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-lg">
            <h4 className="text-sm font-medium text-[var(--error)] mb-2">Please fix the following:</h4>
            <ul className="list-disc list-inside text-sm text-[var(--error)] space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 btn btn-primary py-4"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Aggregate'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary py-4 sm:w-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results */}
      {showResults && result && (
        <div ref={resultsRef} className="card p-6 md:p-8 animate-fade-in">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Your NUST Aggregate</h3>
          
          {/* Main Result */}
          <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
            <div className="text-5xl sm:text-6xl font-bold text-[var(--accent-primary)] mono">
              {result.totalAggregate}%
            </div>
            <p className="mt-2 text-[var(--text-muted)]">Final Aggregate</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              ({result.isOALevel 
                ? result.hasALevelResult 
                  ? 'O/A Level — With A-Level Result' 
                  : 'O/A Level — Result Awaiting'
                : 'FSc Formula'})
            </p>
          </div>

          {/* Breakdown */}
          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Breakdown</h4>
            
            <div className="space-y-3">
              {/* NET */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                    <span className="text-[var(--accent-primary)] font-bold text-xs">75%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">NET Score</p>
                    <p className="text-xs text-[var(--text-muted)]">{netScore}/200</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[var(--accent-primary)] mono">{result.netContribution}%</span>
              </div>

              {result.isOALevel ? (
                /* O/A Level Breakdown */
                <>
                  {result.hasALevelResult && result.aLevelContribution !== undefined && (
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                          <span className="text-[var(--success)] font-bold text-xs">15%</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">A-Level Equivalence</p>
                          <p className="text-xs text-[var(--text-muted)]">{calculatedALevelPercentage.toFixed(2)}%</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[var(--success)] mono">{result.aLevelContribution}%</span>
                    </div>
                  )}
                  {result.oLevelContribution !== undefined && (
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
                          <span className="text-[var(--warning)] font-bold text-xs">{result.hasALevelResult ? '10%' : '25%'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">O-Level Equivalence</p>
                          <p className="text-xs text-[var(--text-muted)]">{calculatedOLevelPercentage.toFixed(2)}%</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[var(--warning)] mono">{result.oLevelContribution}%</span>
                    </div>
                  )}
                  {!result.hasALevelResult && (
                    <p className="text-xs text-[var(--text-muted)] italic px-1">
                      * A-Level result awaiting — O-Level gets 25% weightage
                    </p>
                  )}
                </>
              ) : (
                /* FSc - HSC + SSC */
                <>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[var(--success-light)] flex items-center justify-center">
                        <span className="text-[var(--success)] font-bold text-xs">15%</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">FSc/HSSC</p>
                        <p className="text-xs text-[var(--text-muted)]">{calculatedFscPercentage.toFixed(2)}%</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--success)] mono">{result.hscContribution}%</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[var(--warning-light)] flex items-center justify-center">
                        <span className="text-[var(--warning)] font-bold text-xs">10%</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">SSC/Matric</p>
                        <p className="text-xs text-[var(--text-muted)]">{calculatedSscPercentage.toFixed(2)}%</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[var(--warning)] mono">{result.sscContribution}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 p-4 bg-[var(--accent-light)] border border-[var(--accent-primary)] rounded-lg">
            <p className="text-sm text-[var(--accent-primary)]">
              <strong>What&apos;s next?</strong> Check your admission chances for specific programs →{' '}
              <a href="/admission-predictor" className="underline font-medium hover:no-underline">
                Admission Predictor
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
