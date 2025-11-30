'use client';

import { useState, useMemo, useCallback } from 'react';
import { calculateAggregate, validateAggregateInput, type AggregateInput } from '@/lib/calcAggregate';
import { generatePreferenceList, exportPreferenceListAsText, type PreferenceListResult, type ProgramOption, type UserInterests } from '@/lib/preferenceGenerator';

interface Program {
  id: string;
  name: string;
  code: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  degreeType: string;
  seats?: number | null;
}

interface MeritData {
  programId: string;
  year: number;
  closingAggregate: number | null;
}

interface PreferenceGeneratorClientProps {
  programs: Program[];
  latestMeritData: Record<string, MeritData>;
}

export default function PreferenceGeneratorClient({ programs, latestMeritData }: PreferenceGeneratorClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [aggregate, setAggregate] = useState<number>(0);
  const [aggregateInput, setAggregateInput] = useState<string>('');
  const [selectedProgramIds, setSelectedProgramIds] = useState<Set<string>>(new Set());
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [result, setResult] = useState<PreferenceListResult | null>(null);
  const [useCalculator, setUseCalculator] = useState(false);
  const [formData, setFormData] = useState<AggregateInput>({
    netScore: 0,
    hscPercentage: 0,
    sscPercentage: 0,
    useEquivalence: false,
  });

  // Group programs by discipline
  const programsByDiscipline = useMemo(() => {
    const grouped: Record<string, Program[]> = {};
    programs.forEach(p => {
      if (!grouped[p.disciplineGroup]) grouped[p.disciplineGroup] = [];
      grouped[p.disciplineGroup].push(p);
    });
    return grouped;
  }, [programs]);

  const handleToggleProgram = useCallback((programId: string) => {
    setSelectedProgramIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  }, []);

  const handleCalculateAggregate = useCallback(() => {
    const validation = validateAggregateInput(formData);
    if (!validation.isValid) return;
    
    const result = calculateAggregate(formData);
    setAggregate(result.totalAggregate);
    setAggregateInput(result.totalAggregate.toString());
    setUseCalculator(false);
  }, [formData]);

  const handleGenerate = useCallback(() => {
    if (!aggregate || selectedProgramIds.size === 0) return;

    const selectedPrograms: ProgramOption[] = programs
      .filter(p => selectedProgramIds.has(p.id))
      .map(p => ({
        programId: p.id,
        programName: p.name,
        campus: p.campus,
        school: p.school,
        disciplineGroup: p.disciplineGroup,
        lastYearClosingAggregate: latestMeritData[p.id]?.closingAggregate ?? null,
        seats: p.seats,
      }));

    const interests: UserInterests = {
      disciplineScores: {},
      preferredCampuses: [],
      riskTolerance,
    };

    const generatedResult = generatePreferenceList(aggregate, selectedPrograms, interests);
    setResult(generatedResult);
    setStep(3);
  }, [aggregate, selectedProgramIds, programs, latestMeritData, riskTolerance]);

  const handleExport = useCallback(() => {
    if (!result) return;
    const text = exportPreferenceListAsText(result);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nust-preference-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step >= s ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-color)]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-[var(--text-muted)]">
        {step === 1 && 'Step 1: Enter Your Aggregate'}
        {step === 2 && 'Step 2: Select Programs'}
        {step === 3 && 'Step 3: Your Preference List'}
      </div>

      {/* Step 1: Aggregate Input */}
      {step === 1 && (
        <div className="card p-6 md:p-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Enter Your Aggregate</h2>
          
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setUseCalculator(false)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                !useCalculator ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
              }`}
            >
              Enter Directly
            </button>
            <button
              onClick={() => setUseCalculator(true)}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                useCalculator ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]'
              }`}
            >
              Calculate
            </button>
          </div>

          {!useCalculator ? (
            <div>
              <label htmlFor="aggregate" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Your Aggregate Percentage
              </label>
              <input
                type="number"
                id="aggregate"
                min="0"
                max="100"
                step="0.01"
                value={aggregateInput}
                onChange={(e) => {
                  setAggregateInput(e.target.value);
                  setAggregate(parseFloat(e.target.value) || 0);
                }}
                placeholder="Enter your aggregate (e.g., 75.5)"
                className="input"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">NET Score (out of 200)</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.netScore || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, netScore: parseFloat(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">FSc/HSSC Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.hscPercentage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hscPercentage: parseFloat(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Matric Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.sscPercentage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sscPercentage: parseFloat(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
              <button
                onClick={handleCalculateAggregate}
                className="w-full btn btn-secondary"
              >
                Calculate Aggregate
              </button>
            </div>
          )}

          {aggregate > 0 && (
            <div className="mt-6 p-4 bg-[var(--accent-light)] border border-[var(--accent-primary)] rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">Your Aggregate</p>
              <p className="text-2xl font-bold text-[var(--accent-primary)] mono">{aggregate.toFixed(2)}%</p>
            </div>
          )}

          <button
            onClick={() => aggregate > 0 && setStep(2)}
            disabled={aggregate <= 0}
            className="w-full mt-6 btn btn-primary py-4 disabled:opacity-50"
          >
            Continue to Program Selection
          </button>
        </div>
      )}

      {/* Step 2: Program Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="card p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Your Aggregate</p>
              <p className="text-xl font-bold text-[var(--accent-primary)] mono">{aggregate.toFixed(2)}%</p>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-[var(--accent-primary)] hover:underline">
              Edit
            </button>
          </div>

          <div className="card p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Select Programs</h2>
              <span className="text-sm text-[var(--text-muted)]">{selectedProgramIds.size} selected</span>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {Object.entries(programsByDiscipline).map(([discipline, progs]) => (
                <div key={discipline}>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">{discipline}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {progs.map(program => (
                      <button
                        key={program.id}
                        onClick={() => handleToggleProgram(program.id)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          selectedProgramIds.has(program.id)
                            ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                            : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]'
                        }`}
                      >
                        <p className="text-sm font-medium">{program.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{program.campus}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Risk Tolerance */}
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Risk Tolerance</label>
              <div className="flex gap-3">
                {(['Conservative', 'Moderate', 'Aggressive'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setRiskTolerance(level)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                      riskTolerance === level
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                        : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedProgramIds.size === 0}
              className="w-full mt-6 btn btn-primary py-4 disabled:opacity-50"
            >
              Generate Preference List
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Your Preference List</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {result.summary.totalPrograms} programs • Average chance: {result.summary.averageChance.toFixed(0)}%
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="btn btn-secondary text-sm"
                >
                  Export
                </button>
                <button
                  onClick={() => { setStep(1); setResult(null); setSelectedProgramIds(new Set()); }}
                  className="btn btn-secondary text-sm"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-[var(--success-light)] border border-[var(--success)] rounded-lg text-center">
                <div className="text-2xl font-bold text-[var(--success)]">{result.summary.safeCount}</div>
                <div className="text-xs text-[var(--text-muted)]">Safe</div>
              </div>
              <div className="p-3 bg-[var(--warning-light)] border border-[var(--warning)] rounded-lg text-center">
                <div className="text-2xl font-bold text-[var(--warning)]">{result.summary.moderateCount}</div>
                <div className="text-xs text-[var(--text-muted)]">Moderate</div>
              </div>
              <div className="p-3 bg-[var(--error-light)] border border-[var(--error)] rounded-lg text-center">
                <div className="text-2xl font-bold text-[var(--error)]">{result.summary.ambitiousCount}</div>
                <div className="text-xs text-[var(--text-muted)]">Ambitious</div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Recommendations</h3>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)]">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ranked List */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Ranked Preference Order</h3>
            <div className="space-y-3">
              {result.rankedList.map((item) => (
                <div
                  key={item.program.programId}
                  className={`p-4 rounded-lg border ${
                    item.riskCategory === 'Safe' 
                      ? 'bg-[var(--success-light)] border-[var(--success)]'
                      : item.riskCategory === 'Moderate'
                      ? 'bg-[var(--warning-light)] border-[var(--warning)]'
                      : 'bg-[var(--error-light)] border-[var(--error)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        item.riskCategory === 'Safe' 
                          ? 'bg-[var(--success)]'
                          : item.riskCategory === 'Moderate'
                          ? 'bg-[var(--warning)]'
                          : 'bg-[var(--error)]'
                      }`}>
                        {item.rank}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{item.program.programName}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{item.program.campus} • {item.program.school}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">{item.reasoning}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--text-primary)]">{item.chancePercentage}%</div>
                      <div className="text-xs text-[var(--text-muted)]">{item.riskCategory}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
