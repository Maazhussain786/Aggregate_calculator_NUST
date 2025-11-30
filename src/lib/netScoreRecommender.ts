/**
 * NET Score Recommender
 * 
 * Calculates the recommended NET score needed to achieve
 * a target program admission with high confidence.
 */

import { calculateRequiredNetScore, AGGREGATE_CONFIG } from './calcAggregate';
import { PREDICTION_CONFIG } from './chancePredictor';

// ============================================
// Types & Interfaces
// ============================================

export interface NetScoreRecommendationInput {
  /** Target program name */
  programName: string;
  /** Last year's closing aggregate for the program */
  lastYearClosingAggregate: number;
  /** User's HSC/FSc percentage */
  hscPercentage: number;
  /** User's SSC/Matric percentage */
  sscPercentage: number;
  /** Whether using O/A Level equivalence */
  useEquivalence?: boolean;
  /** Equivalence percentage (if applicable) */
  equivalencePercentage?: number;
}

export interface NetScoreRecommendation {
  /** Minimum NET score for any chance */
  minimumNetScore: number;
  /** Recommended NET score for good chance */
  recommendedNetScore: number;
  /** Target NET score for high chance */
  targetNetScore: number;
  /** Maximum possible NET score */
  maxNetScore: number;
  /** Achievability status */
  achievability: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging' | 'Not Achievable';
  /** Color for achievability */
  achievabilityColor: string;
  /** Detailed explanation */
  explanation: string;
  /** Aggregate breakdown at different NET scores */
  scenarios: NetScoreScenario[];
}

export interface NetScoreScenario {
  netScore: number;
  resultingAggregate: number;
  chanceCategory: string;
  description: string;
}

// ============================================
// Configuration
// ============================================

export const NET_RECOMMENDER_CONFIG = {
  /** Margins above closing aggregate for different chance levels */
  MARGINS: {
    MINIMUM: -1,     // Minimum chance (closing - 1%)
    RECOMMENDED: 1,  // Good chance (closing + 1%)
    TARGET: 3,       // High chance (closing + 3%)
  },
  
  /** Achievability thresholds (NET scores) */
  ACHIEVABILITY: {
    EASY: 120,          // Score <= 120 is achievable for most
    MODERATE: 150,      // Score <= 150 requires effort
    CHALLENGING: 175,   // Score <= 175 is challenging
    VERY_CHALLENGING: 190, // Score <= 190 is very challenging
    // Above 190 is considered very difficult
  },
} as const;

// ============================================
// Core Functions
// ============================================

/**
 * Calculates recommended NET scores for target program
 */
export function getNetScoreRecommendation(
  input: NetScoreRecommendationInput
): NetScoreRecommendation {
  const {
    programName,
    lastYearClosingAggregate,
    hscPercentage,
    sscPercentage,
    useEquivalence,
    equivalencePercentage,
  } = input;

  const effectiveHsc = useEquivalence && equivalencePercentage !== undefined
    ? equivalencePercentage
    : hscPercentage;

  const { MARGINS, ACHIEVABILITY } = NET_RECOMMENDER_CONFIG;

  // Calculate required NET scores for different targets
  const minimumTarget = lastYearClosingAggregate + MARGINS.MINIMUM;
  const recommendedTarget = lastYearClosingAggregate + MARGINS.RECOMMENDED;
  const highTarget = lastYearClosingAggregate + MARGINS.TARGET;

  const minimumResult = calculateRequiredNetScore(minimumTarget, effectiveHsc, sscPercentage);
  const recommendedResult = calculateRequiredNetScore(recommendedTarget, effectiveHsc, sscPercentage);
  const targetResult = calculateRequiredNetScore(highTarget, effectiveHsc, sscPercentage);

  // Determine achievability based on recommended score
  const achievability = getAchievability(recommendedResult.requiredNetScore);
  const achievabilityColor = getAchievabilityColor(achievability);

  // Generate scenarios
  const scenarios = generateScenarios(
    effectiveHsc,
    sscPercentage,
    lastYearClosingAggregate,
    recommendedResult.requiredNetScore
  );

  // Generate explanation
  const explanation = generateExplanation(
    programName,
    lastYearClosingAggregate,
    minimumResult.requiredNetScore,
    recommendedResult.requiredNetScore,
    targetResult.requiredNetScore,
    effectiveHsc,
    sscPercentage,
    achievability
  );

  return {
    minimumNetScore: minimumResult.requiredNetScore,
    recommendedNetScore: recommendedResult.requiredNetScore,
    targetNetScore: targetResult.requiredNetScore,
    maxNetScore: AGGREGATE_CONFIG.MAX_NET_SCORE,
    achievability,
    achievabilityColor,
    explanation,
    scenarios,
  };
}

/**
 * Determines achievability level based on required NET score
 */
function getAchievability(
  requiredScore: number
): 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging' | 'Not Achievable' {
  const { ACHIEVABILITY } = NET_RECOMMENDER_CONFIG;
  const maxScore = AGGREGATE_CONFIG.MAX_NET_SCORE;

  if (requiredScore > maxScore) {
    return 'Not Achievable';
  }
  if (requiredScore <= ACHIEVABILITY.EASY) {
    return 'Easy';
  }
  if (requiredScore <= ACHIEVABILITY.MODERATE) {
    return 'Moderate';
  }
  if (requiredScore <= ACHIEVABILITY.CHALLENGING) {
    return 'Challenging';
  }
  if (requiredScore <= ACHIEVABILITY.VERY_CHALLENGING) {
    return 'Very Challenging';
  }
  return 'Very Challenging';
}

/**
 * Gets color class for achievability level
 */
function getAchievabilityColor(
  achievability: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging' | 'Not Achievable'
): string {
  switch (achievability) {
    case 'Easy':
      return 'text-green-600 bg-green-100';
    case 'Moderate':
      return 'text-blue-600 bg-blue-100';
    case 'Challenging':
      return 'text-amber-600 bg-amber-100';
    case 'Very Challenging':
      return 'text-orange-600 bg-orange-100';
    case 'Not Achievable':
      return 'text-red-600 bg-red-100';
  }
}

/**
 * Generates scenarios showing aggregate at different NET scores
 */
function generateScenarios(
  hscPercentage: number,
  sscPercentage: number,
  closingAggregate: number,
  recommendedScore: number
): NetScoreScenario[] {
  const scenarios: NetScoreScenario[] = [];
  const { MAX_NET_SCORE, WEIGHTS } = AGGREGATE_CONFIG;

  // Generate scenarios at key NET score points
  const scorePoints = [
    Math.max(80, recommendedScore - 30),
    Math.max(100, recommendedScore - 15),
    recommendedScore,
    Math.min(MAX_NET_SCORE, recommendedScore + 15),
    Math.min(MAX_NET_SCORE, recommendedScore + 30),
  ].filter((score, index, arr) => arr.indexOf(score) === index); // Remove duplicates

  for (const netScore of scorePoints) {
    const netPercentage = (netScore / MAX_NET_SCORE) * 100;
    const aggregate = (netPercentage * WEIGHTS.NET) + (hscPercentage * WEIGHTS.HSC) + (sscPercentage * WEIGHTS.SSC);
    
    let chanceCategory: string;
    let description: string;

    const diff = aggregate - closingAggregate;
    if (diff >= 2) {
      chanceCategory = 'High Chance';
      description = 'Strong position for admission';
    } else if (diff >= 0) {
      chanceCategory = 'Medium Chance';
      description = 'Competitive, good chance';
    } else if (diff >= -2) {
      chanceCategory = 'Low Chance';
      description = 'Below cutoff, risky';
    } else {
      chanceCategory = 'Very Low Chance';
      description = 'Significantly below cutoff';
    }

    scenarios.push({
      netScore,
      resultingAggregate: parseFloat(aggregate.toFixed(2)),
      chanceCategory,
      description,
    });
  }

  return scenarios;
}

/**
 * Generates detailed explanation text
 */
function generateExplanation(
  programName: string,
  closingAggregate: number,
  minimumNet: number,
  recommendedNet: number,
  targetNet: number,
  hscPercentage: number,
  sscPercentage: number,
  achievability: string
): string {
  let explanation = `To have a good chance at ${programName} (last year closing: ${closingAggregate.toFixed(1)}%), `;
  explanation += `with your academic scores (HSC: ${hscPercentage.toFixed(1)}%, SSC: ${sscPercentage.toFixed(1)}%):\n\n`;

  explanation += `📊 NET Score Targets:\n`;
  explanation += `• Minimum chance: NET ≥ ${minimumNet}/200\n`;
  explanation += `• Good chance: NET ≥ ${recommendedNet}/200 (Recommended)\n`;
  explanation += `• High chance: NET ≥ ${targetNet}/200\n\n`;

  if (achievability === 'Not Achievable') {
    explanation += `⚠️ Note: The required NET score exceeds the maximum (200). `;
    explanation += `You may need to improve your academic scores or consider programs with lower cutoffs.`;
  } else if (achievability === 'Very Challenging') {
    explanation += `⚠️ Note: This target is very challenging. Consider also applying to programs with lower cutoffs as backup options.`;
  } else if (achievability === 'Easy' || achievability === 'Moderate') {
    explanation += `✅ This target is achievable with dedicated preparation.`;
  }

  return explanation;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Gets NET score needed for specific aggregate with given academic scores
 */
export function getNetForTargetAggregate(
  targetAggregate: number,
  hscPercentage: number,
  sscPercentage: number
): number {
  const result = calculateRequiredNetScore(targetAggregate, hscPercentage, sscPercentage);
  return result.requiredNetScore;
}

/**
 * Checks if a target program is achievable with current academic scores
 */
export function isProgramAchievable(
  closingAggregate: number,
  hscPercentage: number,
  sscPercentage: number
): { achievable: boolean; maxPossibleAggregate: number; gap: number } {
  const { MAX_NET_SCORE, WEIGHTS } = AGGREGATE_CONFIG;
  
  // Calculate maximum possible aggregate (with perfect NET score)
  const maxNetPercentage = 100;
  const maxAggregate = (maxNetPercentage * WEIGHTS.NET) + (hscPercentage * WEIGHTS.HSC) + (sscPercentage * WEIGHTS.SSC);
  
  const gap = closingAggregate - maxAggregate;
  
  return {
    achievable: gap <= 0,
    maxPossibleAggregate: parseFloat(maxAggregate.toFixed(2)),
    gap: parseFloat(Math.max(0, gap).toFixed(2)),
  };
}

