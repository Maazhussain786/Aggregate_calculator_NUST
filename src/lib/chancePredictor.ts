/**
 * NUST Admission Chance Predictor
 * 
 * Rule-based prediction logic that compares user's aggregate
 * with historical closing data to estimate admission chances.
 */

// ============================================
// Types & Interfaces
// ============================================

export type ChanceCategory = 'High Chance' | 'Medium Chance' | 'Low Chance' | 'Very Low Chance';

export interface PredictionInput {
  userAggregate: number;
  programId: string;
  programName: string;
  lastYearClosingAggregate?: number | null;
  lastYearClosingPosition?: number | null;
  averageClosingAggregate?: number | null; // Average of last 3 years
}

export interface PredictionResult {
  /** Numeric chance percentage (0-100) */
  chancePercentage: number;
  /** Category label */
  category: ChanceCategory;
  /** Color for UI display */
  categoryColor: string;
  /** Detailed explanation */
  explanation: string;
  /** Additional tips */
  tips: string[];
  /** Data used for prediction */
  metadata: {
    userAggregate: number;
    lastYearClosingAggregate: number | null;
    difference: number | null;
    dataAvailable: boolean;
  };
}

// ============================================
// Configuration (Easy to tweak later)
// ============================================

export const PREDICTION_CONFIG = {
  /**
   * Thresholds for chance calculation
   * These values determine how the chance percentage is calculated
   * based on the difference between user aggregate and closing aggregate
   */
  THRESHOLDS: {
    /** If user is this much above closing, HIGH chance */
    HIGH_ABOVE: 2, // +2% above closing
    /** If user is this much above closing, MEDIUM-HIGH chance */
    MEDIUM_HIGH_ABOVE: 0, // At or above closing
    /** If user is this much below closing, still MEDIUM chance */
    MEDIUM_BELOW: -1, // Up to 1% below closing
    /** Below this threshold, LOW chance */
    LOW_BELOW: -3, // More than 3% below closing
  },

  /**
   * Chance percentages for each category
   */
  CHANCE_RANGES: {
    HIGH: { min: 80, max: 95 },
    MEDIUM_HIGH: { min: 60, max: 79 },
    MEDIUM: { min: 40, max: 59 },
    LOW: { min: 15, max: 39 },
    VERY_LOW: { min: 5, max: 14 },
  },

  /**
   * Safety margin to add to closing aggregate for recommendations
   */
  SAFETY_MARGIN: 2, // +2% for safety
} as const;

// ============================================
// Core Prediction Functions
// ============================================

/**
 * Predicts admission chances based on user aggregate and historical data
 */
export function predictChance(input: PredictionInput): PredictionResult {
  const { userAggregate, programName, lastYearClosingAggregate, averageClosingAggregate } = input;

  // Use last year's closing or average if not available
  const referenceAggregate = lastYearClosingAggregate ?? averageClosingAggregate ?? null;

  // If no historical data available
  if (referenceAggregate === null) {
    return createNoDataPrediction(userAggregate, programName);
  }

  // Calculate difference
  const difference = userAggregate - referenceAggregate;

  // Determine category and chance
  const { category, chancePercentage } = calculateChanceFromDifference(difference);

  // Generate explanation
  const explanation = generateExplanation(
    userAggregate,
    referenceAggregate,
    difference,
    category,
    programName
  );

  // Generate tips
  const tips = generateTips(category, difference, userAggregate);

  return {
    chancePercentage,
    category,
    categoryColor: getCategoryColor(category),
    explanation,
    tips,
    metadata: {
      userAggregate,
      lastYearClosingAggregate: referenceAggregate,
      difference,
      dataAvailable: true,
    },
  };
}

/**
 * Calculates chance percentage and category based on difference from closing
 */
function calculateChanceFromDifference(difference: number): {
  category: ChanceCategory;
  chancePercentage: number;
} {
  const { THRESHOLDS, CHANCE_RANGES } = PREDICTION_CONFIG;

  if (difference >= THRESHOLDS.HIGH_ABOVE) {
    // High Chance: User is well above closing
    const range = CHANCE_RANGES.HIGH;
    const chancePercentage = Math.min(range.max, range.min + (difference - THRESHOLDS.HIGH_ABOVE) * 3);
    return { category: 'High Chance', chancePercentage: Math.round(chancePercentage) };
  }

  if (difference >= THRESHOLDS.MEDIUM_HIGH_ABOVE) {
    // Medium-High Chance: User is at or slightly above closing
    const range = CHANCE_RANGES.MEDIUM_HIGH;
    const factor = (difference - THRESHOLDS.MEDIUM_HIGH_ABOVE) / (THRESHOLDS.HIGH_ABOVE - THRESHOLDS.MEDIUM_HIGH_ABOVE);
    const chancePercentage = range.min + (range.max - range.min) * factor;
    return { category: 'Medium Chance', chancePercentage: Math.round(chancePercentage) };
  }

  if (difference >= THRESHOLDS.MEDIUM_BELOW) {
    // Medium Chance: User is slightly below closing
    const range = CHANCE_RANGES.MEDIUM;
    const factor = (difference - THRESHOLDS.MEDIUM_BELOW) / (THRESHOLDS.MEDIUM_HIGH_ABOVE - THRESHOLDS.MEDIUM_BELOW);
    const chancePercentage = range.min + (range.max - range.min) * factor;
    return { category: 'Medium Chance', chancePercentage: Math.round(chancePercentage) };
  }

  if (difference >= THRESHOLDS.LOW_BELOW) {
    // Low Chance: User is below closing
    const range = CHANCE_RANGES.LOW;
    const factor = (difference - THRESHOLDS.LOW_BELOW) / (THRESHOLDS.MEDIUM_BELOW - THRESHOLDS.LOW_BELOW);
    const chancePercentage = range.min + (range.max - range.min) * factor;
    return { category: 'Low Chance', chancePercentage: Math.round(chancePercentage) };
  }

  // Very Low Chance: User is significantly below closing
  const range = CHANCE_RANGES.VERY_LOW;
  const chancePercentage = Math.max(range.min, range.max + (difference - THRESHOLDS.LOW_BELOW) * 2);
  return { category: 'Very Low Chance', chancePercentage: Math.round(chancePercentage) };
}

/**
 * Creates prediction result when no historical data is available
 */
function createNoDataPrediction(userAggregate: number, programName: string): PredictionResult {
  return {
    chancePercentage: 50, // Neutral
    category: 'Medium Chance',
    categoryColor: getCategoryColor('Medium Chance'),
    explanation: `We don't have historical closing data for ${programName} yet. Based on general NUST trends, your aggregate of ${userAggregate.toFixed(2)}% puts you in a reasonable position, but we can't provide a precise prediction.`,
    tips: [
      'Check official NUST announcements for previous year closing merits',
      'Consider this program as a moderate-risk option in your preferences',
      'Keep improving your NET score to increase your chances',
    ],
    metadata: {
      userAggregate,
      lastYearClosingAggregate: null,
      difference: null,
      dataAvailable: false,
    },
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generates detailed explanation text
 */
function generateExplanation(
  userAggregate: number,
  closingAggregate: number,
  difference: number,
  category: ChanceCategory,
  programName: string
): string {
  const aboveBelow = difference >= 0 ? 'above' : 'below';
  const diffAbs = Math.abs(difference).toFixed(2);

  let baseExplanation = `Your aggregate of ${userAggregate.toFixed(2)}% is ${diffAbs}% ${aboveBelow} last year's closing aggregate of ${closingAggregate.toFixed(2)}% for ${programName}.`;

  switch (category) {
    case 'High Chance':
      return `${baseExplanation} This puts you in a strong position with a high probability of admission. You're likely to get selected in the early merit lists.`;
    case 'Medium Chance':
      return `${baseExplanation} Your position is competitive. You have a reasonable chance of admission, especially if seats remain after initial lists or competition is lower than last year.`;
    case 'Low Chance':
      return `${baseExplanation} Admission to this program is challenging with your current aggregate. Consider having backup options and try to improve your NET score if retaking.`;
    case 'Very Low Chance':
      return `${baseExplanation} This program is highly competitive for your current aggregate. We strongly recommend considering alternative programs or campuses with lower cutoffs.`;
  }
}

/**
 * Generates helpful tips based on prediction
 */
function generateTips(category: ChanceCategory, difference: number, userAggregate: number): string[] {
  const tips: string[] = [];

  switch (category) {
    case 'High Chance':
      tips.push('Keep this program high in your preference list');
      tips.push('You may also qualify for more competitive programs');
      tips.push('Stay prepared for document verification');
      break;
    case 'Medium Chance':
      tips.push('Include this program in your middle preferences');
      tips.push('Have backup options with lower cutoffs');
      tips.push('Monitor merit list releases carefully');
      break;
    case 'Low Chance':
      tips.push('Consider this as a reach/stretch option');
      tips.push('Prioritize programs with lower closing merits');
      tips.push('Look at alternative campuses for similar programs');
      break;
    case 'Very Low Chance':
      tips.push('Strongly consider alternative programs');
      tips.push('Check programs at other NUST campuses');
      tips.push('Consider retaking NET if possible');
      break;
  }

  // Add aggregate-specific tips
  if (userAggregate < 60) {
    tips.push('Focus on programs with historically lower cutoffs');
  }

  return tips;
}

/**
 * Gets color class for category
 */
function getCategoryColor(category: ChanceCategory): string {
  switch (category) {
    case 'High Chance':
      return 'text-green-600 bg-green-100';
    case 'Medium Chance':
      return 'text-amber-600 bg-amber-100';
    case 'Low Chance':
      return 'text-orange-600 bg-orange-100';
    case 'Very Low Chance':
      return 'text-red-600 bg-red-100';
  }
}

// ============================================
// Position-Based Prediction (For when aggregate is not available)
// ============================================

/**
 * Estimates required aggregate from merit position
 * This is a placeholder mapping - refine with real data later
 */
export function estimateAggregateFromPosition(
  meritPosition: number,
  programTotalSeats: number = 100
): number {
  // Simplified linear mapping (to be refined with real data)
  // Assumes top positions have ~90% aggregate, position at seats has ~70%
  const positionRatio = Math.min(meritPosition / programTotalSeats, 2);
  const estimatedAggregate = 90 - (positionRatio * 20);
  return Math.max(50, Math.min(95, estimatedAggregate));
}

/**
 * Predicts admission chance from merit position
 */
export function predictChanceFromPosition(
  userAggregate: number,
  lastYearClosingPosition: number,
  programSeats: number,
  programName: string
): PredictionResult {
  // Estimate closing aggregate from position
  const estimatedClosingAggregate = estimateAggregateFromPosition(
    lastYearClosingPosition,
    programSeats
  );

  // Use standard prediction
  return predictChance({
    userAggregate,
    programId: '',
    programName,
    lastYearClosingAggregate: estimatedClosingAggregate,
  });
}

