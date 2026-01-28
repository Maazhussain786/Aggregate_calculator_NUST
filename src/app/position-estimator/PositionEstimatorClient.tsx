'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateAggregate, validateAggregateInput, type AggregateInput, type AggregateBreakdown } from '@/lib/calcAggregate';
import { estimatePosition, type PositionEstimateResult, type PositionDataPoint } from '@/lib/positionEstimator';

// NET Types based on official NUST admission policy
export type NETType = 'engineering' | 'business' | 'applied-sciences' | 'architecture' | 'natural-sciences';

export interface NETTypeInfo {
  id: NETType;
  name: string;
  fullName: string;
  description: string;
  programs: string[];
  subjects: { name: string; weight: string }[];
}

export const NET_TYPES: NETTypeInfo[] = [
  {
    id: 'engineering',
    name: 'NET-Engineering',
    fullName: 'NET-Engineering (Including Computing)',
    description: 'For all Engineering & Computing Programs',
    programs: [
      'All Engineering Programs (Mechanical, Electrical, Civil, Chemical, etc.)',
      'All Computing Programs (CS, SE, DS, AI, CE, IS, Bioinformatics)',
      'BS Mathematics, Physics, Chemistry (Pre-Engineering background)',
      'BS Food Science & Technology (Pre-Engineering background)',
    ],
    subjects: [
      { name: 'Mathematics', weight: '50%' },
      { name: 'Physics', weight: '30%' },
      { name: 'English', weight: '20%' },
    ],
  },
  {
    id: 'business',
    name: 'NET-Business',
    fullName: 'NET-Business Studies & Social Sciences',
    description: 'For Business & Social Sciences Programs',
    programs: [
      'BBA (NBS)',
      'BS Accounting & Finance (NBS)',
      'BS Tourism & Hospitality (NBS)',
      'BS Economics (S3H)',
      'BS Mass Communication (S3H)',
      'BS Psychology (S3H)',
      'BS Liberal Arts & Humanities (S3H)',
      'Bachelor of Public Administration (JSPPL)',
      'LLB (NLS)',
    ],
    subjects: [
      { name: 'Quantitative Mathematics', weight: '50%' },
      { name: 'English', weight: '50%' },
    ],
  },
  {
    id: 'applied-sciences',
    name: 'NET-Applied Sciences',
    fullName: 'NET-Applied Sciences',
    description: 'For Applied Biosciences Programs (Pre-Medical)',
    programs: [
      'BS Biotechnology (ASAB)',
      'BS Environmental Science (SCEE)',
      'BS Agriculture (ASAB)',
      'BS Food Science & Technology (ASAB)',
      'BS Bioinformatics (Pre-Medical background)',
      'BS Chemistry (Pre-Medical background)',
    ],
    subjects: [
      { name: 'Biology', weight: '50%' },
      { name: 'Chemistry', weight: '30%' },
      { name: 'English', weight: '20%' },
    ],
  },
  {
    id: 'architecture',
    name: 'NET-Architecture',
    fullName: 'NET-Architecture & Design',
    description: 'For Architecture & Industrial Design Programs',
    programs: [
      'Bachelor of Architecture (SADA)',
      'Bachelor of Industrial Design (SADA)',
    ],
    subjects: [
      { name: 'Design Aptitude', weight: '50%' },
      { name: 'Mathematics', weight: '30%' },
      { name: 'English', weight: '20%' },
    ],
  },
  {
    id: 'natural-sciences',
    name: 'NET-Natural Sciences',
    fullName: 'NET-Natural Sciences',
    description: 'For Natural Sciences Programs (Non-standard background)',
    programs: [
      'BS Mathematics (SNS)',
      'BS Physics (SNS)',
      'BS Chemistry (SNS)',
    ],
    subjects: [
      { name: 'Mathematics', weight: '50%' },
      { name: 'English', weight: '50%' },
    ],
  },
];

interface PositionEstimatorClientProps {
  positionData: Record<NETType, PositionDataPoint[]>;
}

export default function PositionEstimatorClient({ positionData }: PositionEstimatorClientProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [inputMode, setInputMode] = useState<'calculate' | 'direct'>('calculate');
  const [directAggregate, setDirectAggregate] = useState<number>(0);
  const [formData, setFormData] = useState<AggregateInput>({
    netScore: 0,
    hscPercentage: 0,
    sscPercentage: 0,
    useEquivalence: false,
    equivalencePercentage: undefined,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [aggregateResult, setAggregateResult] = useState<AggregateBreakdown | null>(null);
  const [selectedNETType, setSelectedNETType] = useState<NETTypeInfo | null>(null);
  const [positionEstimate, setPositionEstimate] = useState<PositionEstimateResult | null>(null);

  const handleInputChange = useCallback((field: keyof AggregateInput, value: number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  const handleCalculateAggregate = useCallback(() => {
    if (inputMode === 'direct') {
      if (directAggregate <= 0 || directAggregate > 100) {
        setErrors(['Please enter a valid aggregate between 0 and 100']);
        return;
      }
      setAggregateResult({
        totalAggregate: parseFloat(directAggregate.toFixed(2)),
        netContribution: 0,
        hscContribution: 0,
        sscContribution: 0,
        explanation: 'Direct aggregate input',
        isOALevel: false,
      });
      setStep(2);
      return;
    }

    const validation = validateAggregateInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const result = calculateAggregate(formData);
    setAggregateResult(result);
    setErrors([]);
    setStep(2);
  }, [formData, inputMode, directAggregate]);

  const handleSelectNETType = useCallback((netType: NETTypeInfo) => {
    setSelectedNETType(netType);
  }, []);

  const handleEstimate = useCallback(() => {
    if (!aggregateResult || !selectedNETType) return;

    const netTypePositionData = positionData[selectedNETType.id] || [];

    const estimate = estimatePosition({
      userAggregate: aggregateResult.totalAggregate,
      programId: selectedNETType.id,
      programName: selectedNETType.fullName,
      historicalData: netTypePositionData,
    });

    setPositionEstimate(estimate);
    setStep(3);
  }, [aggregateResult, selectedNETType, positionData]);

  const handleReset = useCallback(() => {
    setStep(1);
    setFormData({
      netScore: 0,
      hscPercentage: 0,
      sscPercentage: 0,
      useEquivalence: false,
      equivalencePercentage: undefined,
    });
    setDirectAggregate(0);
    setAggregateResult(null);
    setSelectedNETType(null);
    setPositionEstimate(null);
    setErrors([]);
  }, []);

  // Auto-scroll to results
  useEffect(() => {
    if ((step === 2 || step === 3) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [step]);

  const getConfidenceColor = (confidence: 'High' | 'Medium' | 'Low') => {
    switch (confidence) {
      case 'High': return 'var(--success)';
      case 'Medium': return 'var(--warning)';
      case 'Low': return 'var(--error)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= s 
                ? 'bg-[var(--accent-primary)] text-white' 
                : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > s ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-color)]'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-[var(--text-muted)]">
        {step === 1 && 'Step 1: Enter Your Aggregate'}
        {step === 2 && 'Step 2: Select NET Type'}
        {step === 3 && 'Step 3: View Position Estimate'}
      </div>

      <div ref={resultsRef}>
        {/* Step 1: Aggregate Input */}
        {step === 1 && (
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Enter Your Aggregate</h2>
            
            {/* Input Mode Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Input Method</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setInputMode('direct')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                    inputMode === 'direct'
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  Enter Aggregate Directly
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('calculate')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                    inputMode === 'calculate'
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                  }`}
                >
                  Calculate from Scores
                </button>
              </div>
            </div>

            {inputMode === 'direct' ? (
              <div>
                <label htmlFor="directAggregate" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Your Aggregate Percentage
                </label>
                <input
                  type="number"
                  id="directAggregate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={directAggregate || ''}
                  onChange={(e) => setDirectAggregate(parseFloat(e.target.value) || 0)}
                  placeholder="Enter your aggregate (e.g., 78.5)"
                  className="input"
                />
              </div>
            ) : (
              <div className="grid gap-6">
                {/* NET Score */}
                <div>
                  <label htmlFor="netScore" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    NET Score <span className="text-[var(--text-muted)]">(out of 200)</span>
                  </label>
                  <input
                    type="number"
                    id="netScore"
                    min="0"
                    max="200"
                    value={formData.netScore || ''}
                    onChange={(e) => handleInputChange('netScore', parseFloat(e.target.value) || 0)}
                    placeholder="Enter your NET score"
                    className="input"
                  />
                </div>

                {/* Education Type */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Education System</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('useEquivalence', false)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                        !formData.useEquivalence
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                          : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                      }`}
                    >
                      FSc / HSSC
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('useEquivalence', true)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                        formData.useEquivalence
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                          : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                      }`}
                    >
                      O/A Levels
                    </button>
                  </div>
                </div>

                {/* HSC/Equivalence */}
                {formData.useEquivalence ? (
                  <div>
                    <label htmlFor="equivalencePercentage" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Equivalence Percentage
                    </label>
                    <input
                      type="number"
                      id="equivalencePercentage"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.equivalencePercentage || ''}
                      onChange={(e) => handleInputChange('equivalencePercentage', parseFloat(e.target.value) || 0)}
                      placeholder="Enter equivalence percentage"
                      className="input"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="hscPercentage" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      FSc / HSSC Percentage
                    </label>
                    <input
                      type="number"
                      id="hscPercentage"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.hscPercentage || ''}
                      onChange={(e) => handleInputChange('hscPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="Enter FSc/HSSC percentage"
                      className="input"
                    />
                  </div>
                )}

                {/* SSC */}
                {!formData.useEquivalence && (
                  <div>
                    <label htmlFor="sscPercentage" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      SSC / Matric Percentage
                    </label>
                    <input
                      type="number"
                      id="sscPercentage"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.sscPercentage || ''}
                      onChange={(e) => handleInputChange('sscPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="Enter Matric/SSC percentage"
                      className="input"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mt-6 p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-lg">
                <ul className="list-disc list-inside text-sm text-[var(--error)] space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleCalculateAggregate}
              className="w-full mt-6 btn btn-primary py-4"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: NET Type Selection */}
        {step === 2 && aggregateResult && (
          <div className="space-y-6">
            {/* Aggregate Summary */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Your Aggregate</h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-[var(--accent-primary)] hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="text-4xl font-bold text-[var(--accent-primary)] mono">{aggregateResult.totalAggregate}%</div>
            </div>

            {/* NET Type Selector */}
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Select Your NET Type</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                NUST has separate merit lists for each NET type. Your position will be the same for all programs within a NET category.
              </p>
              
              <div className="grid gap-4">
                {NET_TYPES.map((netType) => (
                  <button
                    key={netType.id}
                    onClick={() => handleSelectNETType(netType)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedNETType?.id === netType.id
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                        : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${
                            selectedNETType?.id === netType.id 
                              ? 'text-[var(--accent-primary)]' 
                              : 'text-[var(--text-primary)]'
                          }`}>
                            {netType.name}
                          </h3>
                          {selectedNETType?.id === netType.id && (
                            <span className="text-[var(--accent-primary)]">✓</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{netType.description}</p>
                        
                        {/* Test Composition */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {netType.subjects.map((subject, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs px-2 py-1 rounded bg-[var(--bg-input)] text-[var(--text-muted)]"
                            >
                              {subject.name}: {subject.weight}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {positionData[netType.id] && positionData[netType.id].length > 0 && (
                        <div className="text-right ml-4">
                          <p className="text-xs text-[var(--text-muted)]">Data</p>
                          <p className="text-[var(--success)] font-mono text-sm">
                            {positionData[netType.id].length} pts
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedNETType && (
                <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Programs in {selectedNETType.name}:
                  </h4>
                  <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                    {selectedNETType.programs.map((program, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[var(--accent-primary)]">•</span>
                        {program}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={handleEstimate}
                disabled={!selectedNETType}
                className="w-full mt-6 btn btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Estimate My Position
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && positionEstimate && selectedNETType && (
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--text-muted)]">NET Type</p>
                <p className="text-[var(--text-primary)] font-medium">{selectedNETType.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Your Aggregate</p>
                <p className="text-[var(--accent-primary)] font-mono text-lg">{aggregateResult?.totalAggregate}%</p>
              </div>
              <button
                onClick={handleReset}
                className="btn btn-secondary text-sm"
              >
                Start Over
              </button>
            </div>

            {/* Position Estimate Card */}
            <div className="card p-6 md:p-8">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Estimated Merit Position</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">{selectedNETType.fullName}</p>

              {/* Main Position Display */}
              <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl">
                <div className="text-5xl sm:text-6xl font-bold text-[var(--accent-primary)] mono">
                  #{positionEstimate.estimatedPosition}
                </div>
                <div className="mt-2 text-[var(--text-secondary)]">
                  Range: {positionEstimate.positionRangeLow} - {positionEstimate.positionRangeHigh}
                </div>
                <div 
                  className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold"
                  style={{ 
                    backgroundColor: `color-mix(in srgb, ${getConfidenceColor(positionEstimate.confidence)} 15%, transparent)`,
                    color: getConfidenceColor(positionEstimate.confidence)
                  }}
                >
                  {positionEstimate.confidence} Confidence
                </div>
              </div>

              {/* Applicable Programs Info */}
              <div className="mt-6 p-4 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-lg">
                <h4 className="text-sm font-semibold text-[var(--accent-primary)] mb-2">
                  ✓ This position applies to all {selectedNETType.name} programs
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Since NUST uses a single merit list per NET type, your estimated position is the same for all programs in this category.
                </p>
              </div>

              {/* Position Visualization */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Position Range</h4>
                <div className="relative h-8 bg-[var(--bg-input)] rounded-full overflow-hidden">
                  {/* Background gradient */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to right, var(--success) 0%, var(--warning) 50%, var(--error) 100%)'
                    }}
                  />
                  {/* Position marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                    style={{
                      left: `${Math.min(95, Math.max(5, (positionEstimate.estimatedPosition / 1000) * 100))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                  <span>Top Positions</span>
                  <span>Lower Positions</span>
                </div>
              </div>

              {/* Historical Data Points */}
              {positionEstimate.metadata.closestDataPoints.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Reference Data Points</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {positionEstimate.metadata.closestDataPoints.map((point, index) => (
                      <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                        <p className="text-xs text-[var(--text-muted)] mb-1">
                          {point.meritListNumber === null ? 'Final List' : `Merit List ${point.meritListNumber}`}
                        </p>
                        <p className="text-lg font-bold text-[var(--text-primary)] mono">
                          {point.aggregate.toFixed(2)}%
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Position: #{point.position}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Analysis</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {positionEstimate.explanation.replace(/\*\*/g, '')}
                </p>
              </div>

              {/* Insights */}
              {positionEstimate.insights.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Insights</h4>
                  <ul className="space-y-2">
                    {positionEstimate.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning for low confidence */}
              {!positionEstimate.dataAvailable && (
                <div className="mt-4 p-4 bg-[var(--warning-light)] rounded-lg">
                  <p className="text-sm text-[var(--warning)]">
                    <strong>Note:</strong> This estimate is based on limited data. 
                    Actual results may vary significantly.
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Related Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/admission-predictor"
                  className="card p-4 hover:border-[var(--accent-primary)] transition-colors group"
                >
                  <h4 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)]">
                    Admission Predictor →
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Predict which merit list you&apos;ll be selected in
                  </p>
                </a>
                <a
                  href="/preference-generator"
                  className="card p-4 hover:border-[var(--accent-primary)] transition-colors group"
                >
                  <h4 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)]">
                    Preference Generator →
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Create an optimized preference list
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
