/**
 * Preference Order Generator
 * 
 * Generates recommended preference lists based on user's aggregate,
 * interests, and historical admission data.
 */

import { predictChance, type PredictionResult } from './chancePredictor';
import { predictMeritList, type MeritListPredictionResult, generateEstimatedThresholds } from './meritListPredictor';

// ============================================
// Types & Interfaces
// ============================================

export type RiskCategory = 'Safe' | 'Moderate' | 'Ambitious';

export interface ProgramOption {
  programId: string;
  programName: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  lastYearClosingAggregate: number | null;
  seats?: number | null;
}

export interface UserInterests {
  /** Interest scores (1-5) for each discipline */
  disciplineScores: Record<string, number>;
  /** Preferred campuses (ordered) */
  preferredCampuses: string[];
  /** Risk tolerance: how aggressive to be with reaches */
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
}

export interface PreferenceItem {
  rank: number;
  program: ProgramOption;
  riskCategory: RiskCategory;
  riskColor: string;
  chancePercentage: number;
  predictedMeritList: number | null;
  interestScore: number;
  overallScore: number; // Combined score for ranking
  reasoning: string;
}

export interface PreferenceListResult {
  /** Full ranked list */
  rankedList: PreferenceItem[];
  /** Grouped by risk */
  byRisk: {
    safe: PreferenceItem[];
    moderate: PreferenceItem[];
    ambitious: PreferenceItem[];
  };
  /** Summary stats */
  summary: {
    totalPrograms: number;
    safeCount: number;
    moderateCount: number;
    ambitiousCount: number;
    averageChance: number;
  };
  /** Recommendations */
  recommendations: string[];
}

// ============================================
// Configuration
// ============================================

export const PREFERENCE_CONFIG = {
  /** Chance thresholds for risk categories */
  RISK_THRESHOLDS: {
    SAFE: 70,      // >= 70% chance = Safe
    MODERATE: 40,  // >= 40% chance = Moderate
    // Below 40% = Ambitious
  },
  
  /** Weights for overall scoring */
  SCORING_WEIGHTS: {
    CHANCE: 0.4,       // 40% weight on admission chance
    INTEREST: 0.35,    // 35% weight on interest
    CAMPUS_PREF: 0.15, // 15% weight on campus preference
    MERIT_LIST: 0.10,  // 10% weight on expected merit list (earlier = better)
  },
  
  /** Recommended mix by risk tolerance */
  RECOMMENDED_MIX: {
    Conservative: { safe: 0.6, moderate: 0.3, ambitious: 0.1 },
    Moderate: { safe: 0.4, moderate: 0.4, ambitious: 0.2 },
    Aggressive: { safe: 0.2, moderate: 0.4, ambitious: 0.4 },
  },
} as const;

// ============================================
// Core Functions
// ============================================

/**
 * Generates a recommended preference list
 */
export function generatePreferenceList(
  userAggregate: number,
  programs: ProgramOption[],
  interests: UserInterests
): PreferenceListResult {
  if (programs.length === 0) {
    return createEmptyResult();
  }

  // Score and categorize each program
  const scoredPrograms: PreferenceItem[] = programs.map((program, index) => {
    // Get chance prediction
    const chancePrediction = predictChance({
      userAggregate,
      programId: program.programId,
      programName: program.programName,
      lastYearClosingAggregate: program.lastYearClosingAggregate,
    });

    // Get merit list prediction
    const thresholds = program.lastYearClosingAggregate
      ? generateEstimatedThresholds(program.lastYearClosingAggregate)
      : [];
    
    const meritListPrediction = predictMeritList({
      userAggregate,
      programId: program.programId,
      programName: program.programName,
      thresholds,
    });

    // Calculate interest score
    const interestScore = getInterestScore(program, interests);
    
    // Calculate campus preference score
    const campusScore = getCampusPreferenceScore(program.campus, interests.preferredCampuses);
    
    // Calculate merit list score (earlier lists = better score)
    const meritListScore = getMeritListScore(meritListPrediction.predictedList);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(
      chancePrediction.chancePercentage,
      interestScore,
      campusScore,
      meritListScore
    );

    // Determine risk category
    const riskCategory = getRiskCategory(chancePrediction.chancePercentage);

    // Generate reasoning
    const reasoning = generateReasoning(
      program,
      chancePrediction,
      meritListPrediction,
      interestScore,
      riskCategory
    );

    return {
      rank: 0, // Will be set after sorting
      program,
      riskCategory,
      riskColor: getRiskColor(riskCategory),
      chancePercentage: chancePrediction.chancePercentage,
      predictedMeritList: meritListPrediction.predictedList,
      interestScore,
      overallScore,
      reasoning,
    };
  });

  // Sort by overall score (descending)
  scoredPrograms.sort((a, b) => b.overallScore - a.overallScore);

  // Assign ranks
  scoredPrograms.forEach((item, index) => {
    item.rank = index + 1;
  });

  // Group by risk
  const byRisk = {
    safe: scoredPrograms.filter(p => p.riskCategory === 'Safe'),
    moderate: scoredPrograms.filter(p => p.riskCategory === 'Moderate'),
    ambitious: scoredPrograms.filter(p => p.riskCategory === 'Ambitious'),
  };

  // Calculate summary
  const summary = {
    totalPrograms: scoredPrograms.length,
    safeCount: byRisk.safe.length,
    moderateCount: byRisk.moderate.length,
    ambitiousCount: byRisk.ambitious.length,
    averageChance: scoredPrograms.reduce((sum, p) => sum + p.chancePercentage, 0) / scoredPrograms.length,
  };

  // Generate recommendations
  const recommendations = generateRecommendations(summary, interests.riskTolerance);

  return {
    rankedList: scoredPrograms,
    byRisk,
    summary,
    recommendations,
  };
}

// ============================================
// Scoring Functions
// ============================================

/**
 * Calculates interest score for a program
 */
function getInterestScore(program: ProgramOption, interests: UserInterests): number {
  const disciplineScore = interests.disciplineScores[program.disciplineGroup] || 3; // Default to neutral (3/5)
  return (disciplineScore / 5) * 100; // Convert to percentage
}

/**
 * Calculates campus preference score
 */
function getCampusPreferenceScore(campus: string, preferredCampuses: string[]): number {
  const index = preferredCampuses.indexOf(campus);
  if (index === -1) return 50; // Not in preferences = neutral
  
  // First preference = 100, decreasing by 15 for each subsequent preference
  return Math.max(10, 100 - (index * 15));
}

/**
 * Calculates merit list score (earlier = better)
 */
function getMeritListScore(predictedList: number | null): number {
  if (predictedList === null) return 20; // Unknown = low score
  
  // 1st list = 100, decreasing by 12 for each subsequent list
  return Math.max(10, 100 - ((predictedList - 1) * 12));
}

/**
 * Calculates overall weighted score
 */
function calculateOverallScore(
  chancePercentage: number,
  interestScore: number,
  campusScore: number,
  meritListScore: number
): number {
  const { SCORING_WEIGHTS } = PREFERENCE_CONFIG;
  
  return (
    chancePercentage * SCORING_WEIGHTS.CHANCE +
    interestScore * SCORING_WEIGHTS.INTEREST +
    campusScore * SCORING_WEIGHTS.CAMPUS_PREF +
    meritListScore * SCORING_WEIGHTS.MERIT_LIST
  );
}

// ============================================
// Categorization Functions
// ============================================

/**
 * Determines risk category based on chance percentage
 */
function getRiskCategory(chancePercentage: number): RiskCategory {
  const { RISK_THRESHOLDS } = PREFERENCE_CONFIG;
  
  if (chancePercentage >= RISK_THRESHOLDS.SAFE) return 'Safe';
  if (chancePercentage >= RISK_THRESHOLDS.MODERATE) return 'Moderate';
  return 'Ambitious';
}

/**
 * Gets color class for risk category
 */
function getRiskColor(category: RiskCategory): string {
  switch (category) {
    case 'Safe':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'Moderate':
      return 'text-amber-600 bg-amber-100 border-amber-200';
    case 'Ambitious':
      return 'text-red-600 bg-red-100 border-red-200';
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generates reasoning text for a preference
 */
function generateReasoning(
  program: ProgramOption,
  chance: PredictionResult,
  meritList: MeritListPredictionResult,
  interestScore: number,
  riskCategory: RiskCategory
): string {
  const parts: string[] = [];
  
  // Chance-based reasoning
  parts.push(`${chance.chancePercentage}% admission chance`);
  
  // Merit list info
  if (meritList.predictedList) {
    const ordinal = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'][meritList.predictedList - 1] || `${meritList.predictedList}th`;
    parts.push(`likely ${ordinal} merit list`);
  }
  
  // Interest note
  if (interestScore >= 80) {
    parts.push('high interest match');
  } else if (interestScore <= 40) {
    parts.push('lower interest match');
  }
  
  // Risk note
  if (riskCategory === 'Safe') {
    parts.push('good backup option');
  } else if (riskCategory === 'Ambitious') {
    parts.push('reach/aspirational choice');
  }
  
  return parts.join(' • ');
}

/**
 * Generates overall recommendations
 */
function generateRecommendations(
  summary: { safeCount: number; moderateCount: number; ambitiousCount: number; totalPrograms: number },
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive'
): string[] {
  const recommendations: string[] = [];
  const recommended = PREFERENCE_CONFIG.RECOMMENDED_MIX[riskTolerance];
  
  const safeRatio = summary.safeCount / summary.totalPrograms;
  const moderateRatio = summary.moderateCount / summary.totalPrograms;
  const ambitiousRatio = summary.ambitiousCount / summary.totalPrograms;
  
  // Check if mix matches recommendation
  if (safeRatio < recommended.safe - 0.1) {
    recommendations.push('Consider adding more safe options to your list for better security.');
  }
  
  if (summary.safeCount === 0) {
    recommendations.push('⚠️ You have no safe options. Strongly consider adding programs with high admission chances.');
  }
  
  if (ambitiousRatio > recommended.ambitious + 0.2) {
    recommendations.push('Your list is heavy on ambitious choices. This is risky - ensure you have backups.');
  }
  
  if (summary.totalPrograms < 5) {
    recommendations.push('Consider adding more program options to increase your chances of admission.');
  }
  
  if (summary.totalPrograms > 15) {
    recommendations.push('You have many options selected. Focus on your top 10-12 preferences.');
  }
  
  // Default positive recommendation
  if (recommendations.length === 0) {
    recommendations.push('Your preference list has a good balance of safe, moderate, and ambitious choices.');
  }
  
  return recommendations;
}

/**
 * Creates empty result when no programs provided
 */
function createEmptyResult(): PreferenceListResult {
  return {
    rankedList: [],
    byRisk: { safe: [], moderate: [], ambitious: [] },
    summary: {
      totalPrograms: 0,
      safeCount: 0,
      moderateCount: 0,
      ambitiousCount: 0,
      averageChance: 0,
    },
    recommendations: ['Please select some programs to generate a preference list.'],
  };
}

// ============================================
// Export Utilities
// ============================================

/**
 * Exports preference list as formatted text
 */
export function exportPreferenceListAsText(result: PreferenceListResult): string {
  let output = '=== NUST Preference List ===\n\n';
  
  output += `Total Programs: ${result.summary.totalPrograms}\n`;
  output += `Safe: ${result.summary.safeCount} | Moderate: ${result.summary.moderateCount} | Ambitious: ${result.summary.ambitiousCount}\n\n`;
  
  output += '--- Ranked List ---\n\n';
  
  for (const item of result.rankedList) {
    output += `${item.rank}. ${item.program.programName}\n`;
    output += `   Campus: ${item.program.campus}\n`;
    output += `   Risk: ${item.riskCategory} | Chance: ${item.chancePercentage}%\n`;
    if (item.predictedMeritList) {
      output += `   Expected Merit List: ${item.predictedMeritList}\n`;
    }
    output += '\n';
  }
  
  output += '--- Recommendations ---\n';
  result.recommendations.forEach(rec => {
    output += `• ${rec}\n`;
  });
  
  return output;
}

