/**
 * Merit List Index Predictor
 * 
 * Predicts in which merit list (1st to 7th/8th) a student
 * might get admission based on their aggregate and historical thresholds.
 */

// ============================================
// Types & Interfaces
// ============================================

export interface MeritListThreshold {
  meritListNumber: number;
  closingAggregate?: number;
  closingPosition?: number;
}

export interface MeritListPredictionInput {
  userAggregate: number;
  programId: string;
  programName: string;
  thresholds: MeritListThreshold[];
}

export interface MeritListPredictionResult {
  /** Predicted merit list number (1-8, or null if unlikely) */
  predictedList: number | null;
  /** Confidence level */
  confidence: 'High' | 'Medium' | 'Low';
  /** Confidence color */
  confidenceColor: string;
  /** Explanation text */
  explanation: string;
  /** Alternative lists user might get into */
  alternatives: number[];
  /** Whether prediction is based on real data or estimates */
  isEstimate: boolean;
}

// ============================================
// Configuration
// ============================================

export const MERIT_LIST_CONFIG = {
  /** Maximum number of merit lists typically released */
  MAX_LISTS: 8,
  
  /** Confidence thresholds (how close user is to threshold) */
  CONFIDENCE_THRESHOLDS: {
    HIGH: 2,    // Within 2% above threshold
    MEDIUM: 0,  // At or slightly below threshold
    LOW: -2,    // More than 2% below
  },
  
  /** Default thresholds when real data not available */
  DEFAULT_AGGREGATE_DROP_PER_LIST: 1.5, // Aggregate typically drops ~1.5% per list
} as const;

// ============================================
// Core Prediction Functions
// ============================================

/**
 * Predicts which merit list the user will likely be selected in
 * 
 * Logic:
 * 1. Sort thresholds by merit list number
 * 2. Find the first list where user aggregate >= closing aggregate
 * 3. Return prediction with confidence level
 */
export function predictMeritList(input: MeritListPredictionInput): MeritListPredictionResult {
  const { userAggregate, programName, thresholds } = input;

  // Check if we have threshold data
  if (thresholds.length === 0) {
    return createNoDataPrediction(userAggregate, programName);
  }

  // Sort thresholds by list number
  const sortedThresholds = [...thresholds].sort((a, b) => a.meritListNumber - b.meritListNumber);

  // Find predicted list
  let predictedList: number | null = null;
  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  let alternatives: number[] = [];
  let closestDifference = Infinity;

  for (const threshold of sortedThresholds) {
    const closingAggregate = threshold.closingAggregate;
    
    if (closingAggregate === undefined) continue;

    const difference = userAggregate - closingAggregate;

    // User qualifies for this list
    if (difference >= 0) {
      if (predictedList === null) {
        predictedList = threshold.meritListNumber;
        confidence = getConfidence(difference);
        closestDifference = difference;
      } else if (Math.abs(difference) < closestDifference) {
        alternatives.push(predictedList);
        predictedList = threshold.meritListNumber;
        confidence = getConfidence(difference);
        closestDifference = difference;
      } else {
        alternatives.push(threshold.meritListNumber);
      }
    } else if (predictedList === null && Math.abs(difference) < 3) {
      // User is close but below threshold - might still qualify
      alternatives.push(threshold.meritListNumber);
    }
  }

  // Generate explanation
  const explanation = generateMeritListExplanation(
    predictedList,
    confidence,
    userAggregate,
    sortedThresholds,
    programName
  );

  return {
    predictedList,
    confidence,
    confidenceColor: getConfidenceColor(confidence),
    explanation,
    alternatives: alternatives.slice(0, 2), // Max 2 alternatives
    isEstimate: false,
  };
}

/**
 * Creates prediction when no historical data is available
 */
function createNoDataPrediction(userAggregate: number, programName: string): MeritListPredictionResult {
  // Make a rough estimate based on aggregate alone
  let estimatedList: number | null;
  let explanation: string;

  if (userAggregate >= 80) {
    estimatedList = 1;
    explanation = `With an aggregate of ${userAggregate.toFixed(2)}%, you have a strong chance of selection in the 1st or 2nd merit list for ${programName}. However, this is an estimate as we don't have historical data.`;
  } else if (userAggregate >= 75) {
    estimatedList = 2;
    explanation = `With an aggregate of ${userAggregate.toFixed(2)}%, you're likely to be selected around the 2nd to 3rd merit list for ${programName}. This is an estimate.`;
  } else if (userAggregate >= 70) {
    estimatedList = 4;
    explanation = `With an aggregate of ${userAggregate.toFixed(2)}%, you might be selected in middle merit lists (3rd-5th) for ${programName}. This is a rough estimate.`;
  } else if (userAggregate >= 65) {
    estimatedList = 6;
    explanation = `With an aggregate of ${userAggregate.toFixed(2)}%, selection might happen in later merit lists (5th-7th) for ${programName}, if seats remain. This is an estimate.`;
  } else {
    estimatedList = null;
    explanation = `With an aggregate of ${userAggregate.toFixed(2)}%, admission to ${programName} may be challenging. Consider programs with lower cutoffs.`;
  }

  return {
    predictedList: estimatedList,
    confidence: 'Low',
    confidenceColor: getConfidenceColor('Low'),
    explanation,
    alternatives: estimatedList ? [estimatedList + 1, estimatedList + 2].filter(n => n <= 8) : [],
    isEstimate: true,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Determines confidence based on difference from threshold
 */
function getConfidence(difference: number): 'High' | 'Medium' | 'Low' {
  const { CONFIDENCE_THRESHOLDS } = MERIT_LIST_CONFIG;
  
  if (difference >= CONFIDENCE_THRESHOLDS.HIGH) {
    return 'High';
  } else if (difference >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Gets color class for confidence level
 */
function getConfidenceColor(confidence: 'High' | 'Medium' | 'Low'): string {
  switch (confidence) {
    case 'High':
      return 'text-green-600 bg-green-100';
    case 'Medium':
      return 'text-amber-600 bg-amber-100';
    case 'Low':
      return 'text-red-600 bg-red-100';
  }
}

/**
 * Generates explanation for merit list prediction
 */
function generateMeritListExplanation(
  predictedList: number | null,
  confidence: 'High' | 'Medium' | 'Low',
  userAggregate: number,
  thresholds: MeritListThreshold[],
  programName: string
): string {
  if (predictedList === null) {
    return `Based on historical data for ${programName}, your aggregate of ${userAggregate.toFixed(2)}% falls below all recorded closing aggregates. Admission is unlikely unless there are significant changes in competition this year.`;
  }

  const ordinal = getOrdinal(predictedList);
  const threshold = thresholds.find(t => t.meritListNumber === predictedList);
  const closingAggregate = threshold?.closingAggregate;

  let base = `Based on historical trends, you're likely to be selected in the ${ordinal} merit list for ${programName}.`;

  if (closingAggregate) {
    const diff = userAggregate - closingAggregate;
    if (diff > 2) {
      base += ` Your aggregate (${userAggregate.toFixed(2)}%) is ${diff.toFixed(2)}% above the historical closing (${closingAggregate.toFixed(2)}%), giving you a comfortable margin.`;
    } else if (diff > 0) {
      base += ` Your aggregate is slightly above the historical closing of ${closingAggregate.toFixed(2)}%.`;
    } else {
      base += ` Your aggregate is close to the historical closing of ${closingAggregate.toFixed(2)}%, so competition levels may affect the outcome.`;
    }
  }

  if (confidence === 'Low') {
    base += ' Note: This prediction has low confidence due to limited data or your aggregate being close to the threshold.';
  }

  return base;
}

/**
 * Gets ordinal suffix for number
 */
function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// ============================================
// Generate Default Thresholds (Placeholder)
// ============================================

/**
 * Generates estimated thresholds when real data not available
 * This creates a declining aggregate for each list
 * 
 * @param baseAggregate - First list closing aggregate
 * @param numLists - Number of lists to generate
 */
export function generateEstimatedThresholds(
  baseAggregate: number = 78,
  numLists: number = 8
): MeritListThreshold[] {
  const thresholds: MeritListThreshold[] = [];
  const { DEFAULT_AGGREGATE_DROP_PER_LIST } = MERIT_LIST_CONFIG;

  for (let i = 1; i <= numLists; i++) {
    thresholds.push({
      meritListNumber: i,
      closingAggregate: Math.max(50, baseAggregate - (i - 1) * DEFAULT_AGGREGATE_DROP_PER_LIST),
    });
  }

  return thresholds;
}

// ============================================
// Batch Prediction
// ============================================

/**
 * Predicts merit lists for multiple programs
 */
export function predictMeritListBatch(
  userAggregate: number,
  programs: Array<{ programId: string; programName: string; thresholds: MeritListThreshold[] }>
): Array<{ programId: string; programName: string; prediction: MeritListPredictionResult }> {
  return programs.map(program => ({
    programId: program.programId,
    programName: program.programName,
    prediction: predictMeritList({
      userAggregate,
      ...program,
    }),
  }));
}

