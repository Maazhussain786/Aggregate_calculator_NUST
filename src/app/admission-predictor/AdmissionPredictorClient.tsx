'use client';

import { useState, useCallback } from 'react';
import { calculateAggregate, validateAggregateInput, type AggregateInput, type AggregateBreakdown } from '@/lib/calcAggregate';
import { predictChance, type PredictionResult } from '@/lib/chancePredictor';
import { predictMeritList, generateEstimatedThresholds, type MeritListPredictionResult } from '@/lib/meritListPredictor';
import ChanceDisplay from '@/components/results/ChanceDisplay';
import MeritListDisplay from '@/components/results/MeritListDisplay';
import ProgramSelector, { type Program } from '@/components/forms/ProgramSelector';

interface MeritData {
  programId: string;
  year: number;
  meritListNumber: number | null;
  closingMeritPosition: number | null;
  closingAggregate: number | null;
  sourceName: string;
}

interface AdmissionPredictorClientProps {
  programs: Program[];
  latestMeritData: Record<string, MeritData>;
}

export default function AdmissionPredictorClient({ programs, latestMeritData }: AdmissionPredictorClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<AggregateInput>({
    netScore: 0,
    hscPercentage: 0,
    sscPercentage: 0,
    useEquivalence: false,
    equivalencePercentage: undefined,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [aggregateResult, setAggregateResult] = useState<AggregateBreakdown | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [chancePrediction, setChancePrediction] = useState<PredictionResult | null>(null);
  const [meritListPrediction, setMeritListPrediction] = useState<MeritListPredictionResult | null>(null);

  const handleInputChange = useCallback((field: keyof AggregateInput, value: number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  const handleCalculateAggregate = useCallback(() => {
    const validation = validateAggregateInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const result = calculateAggregate(formData);
    setAggregateResult(result);
    setErrors([]);
    setStep(2);
  }, [formData]);

  const handleSelectProgram = useCallback((program: Program | null) => {
    setSelectedProgram(program);
  }, []);

  const handlePredict = useCallback(() => {
    if (!aggregateResult || !selectedProgram) return;

    const meritData = latestMeritData[selectedProgram.id];

    // Chance prediction
    const chance = predictChance({
      userAggregate: aggregateResult.totalAggregate,
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      lastYearClosingAggregate: meritData?.closingAggregate ?? null,
    });
    setChancePrediction(chance);

    // Merit list prediction
    const thresholds = meritData?.closingAggregate
      ? generateEstimatedThresholds(meritData.closingAggregate)
      : [];
    
    const meritList = predictMeritList({
      userAggregate: aggregateResult.totalAggregate,
      programId: selectedProgram.id,
      programName: selectedProgram.name,
      thresholds,
    });
    setMeritListPrediction(meritList);

    setStep(3);
  }, [aggregateResult, selectedProgram, latestMeritData]);

  const handleReset = useCallback(() => {
    setStep(1);
    setFormData({
      netScore: 0,
      hscPercentage: 0,
      sscPercentage: 0,
      useEquivalence: false,
      equivalencePercentage: undefined,
    });
    setAggregateResult(null);
    setSelectedProgram(null);
    setChancePrediction(null);
    setMeritListPrediction(null);
    setErrors([]);
  }, []);

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
        {step === 1 && 'Step 1: Enter Your Scores'}
        {step === 2 && 'Step 2: Select Program'}
        {step === 3 && 'Step 3: View Predictions'}
      </div>

      {/* Step 1: Aggregate Calculator */}
      {step === 1 && (
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Calculate Your Aggregate</h2>
          
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
            Calculate & Continue
          </button>
        </div>
      )}

      {/* Step 2: Program Selection */}
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

          {/* Program Selector */}
          <div className="card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Select Target Program</h2>
            
            <ProgramSelector
              programs={programs}
              selectedProgram={selectedProgram}
              onSelect={handleSelectProgram}
              label="Choose a program to check your chances"
              placeholder="Search for a program..."
            />

            {selectedProgram && (
              <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">{selectedProgram.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{selectedProgram.campus} • {selectedProgram.school}</p>
                  </div>
                  {latestMeritData[selectedProgram.id] && (
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-muted)]">Last Year Closing</p>
                      <p className="text-[var(--success)] font-mono">
                        {latestMeritData[selectedProgram.id].closingAggregate?.toFixed(2)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handlePredict}
              disabled={!selectedProgram}
              className="w-full mt-6 btn btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Predict My Chances
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && chancePrediction && meritListPrediction && selectedProgram && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Program</p>
              <p className="text-[var(--text-primary)] font-medium">{selectedProgram.name}</p>
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

          {/* Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChanceDisplay 
              prediction={chancePrediction} 
              programName={selectedProgram.name} 
            />
            <MeritListDisplay 
              prediction={meritListPrediction} 
              programName={selectedProgram.name} 
            />
          </div>

          {/* Next Steps */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">What&apos;s Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/preference-generator"
                className="card p-4 hover:border-[var(--accent-primary)] transition-colors group"
              >
                <h4 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)]">
                  Generate Preference List →
                </h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Create an optimized preference order for your applications
                </p>
              </a>
              <a
                href="/merit-history"
                className="card p-4 hover:border-[var(--accent-primary)] transition-colors group"
              >
                <h4 className="text-[var(--text-primary)] font-medium group-hover:text-[var(--accent-primary)]">
                  View Full Merit History →
                </h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Explore detailed historical data for all programs
                </p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
