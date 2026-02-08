/**
 * Merit Position Estimator
 * 
 * Estimates a student's likely merit position based on their aggregate
 * using historical data with interpolation/extrapolation.
 */

// ============================================
// Types & Interfaces
// ============================================

export interface PositionDataPoint {
  aggregate: number;
  position: number;
  meritListNumber: number | null;
}

export interface PositionEstimateInput {
  userAggregate: number;
  programId: string;
  programName: string;
  historicalData: PositionDataPoint[];
}

export interface PositionEstimateResult {
  /** Estimated position (middle of range) */
  estimatedPosition: number;
  /** Lower bound of position range (better/lower position) */
  positionRangeLow: number;
  /** Upper bound of position range (worse/higher position) */
  positionRangeHigh: number;
  /** Confidence level */
  confidence: 'High' | 'Medium' | 'Low';
  /** Explanation text */
  explanation: string;
  /** Whether data was available for estimation */
  dataAvailable: boolean;
  /** Additional insights */
  insights: string[];
  /** Metadata for display */
  metadata: {
    userAggregate: number;
    closestDataPoints: PositionDataPoint[];
    interpolationMethod: 'interpolation' | 'extrapolation' | 'estimate';
  };
}

// ============================================
// Configuration
// ============================================

export const POSITION_ESTIMATOR_CONFIG = {
  /** Margin of error percentage for range calculation */
  MARGIN_OF_ERROR: 0.15, // 15% margin
  
  /** Minimum margin in positions */
  MIN_MARGIN: 20,
  
  /** Maximum margin in positions */
  MAX_MARGIN: 100,
  
  /** Default position per aggregate point when no data */
  DEFAULT_POSITION_PER_AGGREGATE: 50, // rough estimate
} as const;

// ============================================
// Core Estimation Functions
// ============================================

/**
 * Estimates merit position based on user aggregate and historical data
 */
export function estimatePosition(input: PositionEstimateInput): PositionEstimateResult {
  const { userAggregate, programName, historicalData } = input;

  // Check if we have data
  if (!historicalData || historicalData.length === 0) {
    return createNoDataEstimate(userAggregate, programName);
  }

  // Sort data by aggregate (descending - highest aggregate first)
  const sortedData = [...historicalData]
    .filter(d => d.aggregate !== null && d.position !== null)
    .sort((a, b) => b.aggregate - a.aggregate);

  if (sortedData.length === 0) {
    return createNoDataEstimate(userAggregate, programName);
  }

  // Find surrounding data points for interpolation
  let lowerPoint: PositionDataPoint | null = null; // Higher aggregate, lower position
  let upperPoint: PositionDataPoint | null = null; // Lower aggregate, higher position

  for (const point of sortedData) {
    if (point.aggregate >= userAggregate) {
      lowerPoint = point;
    }
    if (point.aggregate <= userAggregate && !upperPoint) {
      upperPoint = point;
    }
  }

  let estimatedPosition: number;
  let interpolationMethod: 'interpolation' | 'extrapolation' | 'estimate';
  let confidence: 'High' | 'Medium' | 'Low';
  const closestDataPoints: PositionDataPoint[] = [];

  if (lowerPoint && upperPoint && lowerPoint !== upperPoint) {
    // Interpolation between two points
    const aggregateRange = lowerPoint.aggregate - upperPoint.aggregate;
    const positionRange = upperPoint.position - lowerPoint.position;
    const aggregateDiff = lowerPoint.aggregate - userAggregate;
    
    estimatedPosition = lowerPoint.position + (aggregateDiff / aggregateRange) * positionRange;
    interpolationMethod = 'interpolation';
    confidence = 'High';
    closestDataPoints.push(lowerPoint, upperPoint);
  } else if (lowerPoint) {
    // User aggregate is below all data points - extrapolate downward
    const positionPerAggregate = calculatePositionPerAggregate(sortedData);
    const aggregateDiff = lowerPoint.aggregate - userAggregate;
    estimatedPosition = lowerPoint.position + (aggregateDiff * positionPerAggregate);
    interpolationMethod = 'extrapolation';
    confidence = 'Medium';
    closestDataPoints.push(lowerPoint);
  } else if (upperPoint) {
    // User aggregate is above all data points - extrapolate upward
    const positionPerAggregate = calculatePositionPerAggregate(sortedData);
    const aggregateDiff = upperPoint.aggregate - userAggregate;
    estimatedPosition = Math.max(1, upperPoint.position + (aggregateDiff * positionPerAggregate));
    interpolationMethod = 'extrapolation';
    confidence = 'Medium';
    closestDataPoints.push(upperPoint);
  } else {
    // Fallback
    estimatedPosition = POSITION_ESTIMATOR_CONFIG.DEFAULT_POSITION_PER_AGGREGATE * (100 - userAggregate);
    interpolationMethod = 'estimate';
    confidence = 'Low';
  }

  // Ensure position is at least 1
  estimatedPosition = Math.max(1, Math.round(estimatedPosition));

  // Calculate range
  const { positionRangeLow, positionRangeHigh } = calculatePositionRange(estimatedPosition);

  // Generate explanation
  const explanation = generateExplanation(
    userAggregate,
    estimatedPosition,
    positionRangeLow,
    positionRangeHigh,
    interpolationMethod,
    programName,
    closestDataPoints
  );

  // Generate insights
  const insights = generateInsights(
    userAggregate,
    estimatedPosition,
    sortedData,
    programName
  );

  return {
    estimatedPosition,
    positionRangeLow,
    positionRangeHigh,
    confidence,
    explanation,
    dataAvailable: true,
    insights,
    metadata: {
      userAggregate,
      closestDataPoints,
      interpolationMethod,
    },
  };
}

/**
 * Calculates position change per aggregate point from historical data
 */
function calculatePositionPerAggregate(data: PositionDataPoint[]): number {
  if (data.length < 2) {
    return POSITION_ESTIMATOR_CONFIG.DEFAULT_POSITION_PER_AGGREGATE;
  }

  const first = data[0]; // Highest aggregate
  const last = data[data.length - 1]; // Lowest aggregate

  const aggregateRange = first.aggregate - last.aggregate;
  const positionRange = last.position - first.position;

  if (aggregateRange <= 0) {
    return POSITION_ESTIMATOR_CONFIG.DEFAULT_POSITION_PER_AGGREGATE;
  }

  return positionRange / aggregateRange;
}

/**
 * Calculates position range with margin of error
 */
function calculatePositionRange(estimatedPosition: number): {
  positionRangeLow: number;
  positionRangeHigh: number;
} {
  const { MARGIN_OF_ERROR, MIN_MARGIN, MAX_MARGIN } = POSITION_ESTIMATOR_CONFIG;

  let margin = Math.round(estimatedPosition * MARGIN_OF_ERROR);
  margin = Math.max(MIN_MARGIN, Math.min(MAX_MARGIN, margin));

  return {
    positionRangeLow: Math.max(1, estimatedPosition - margin),
    positionRangeHigh: estimatedPosition + margin,
  };
}

/**
 * Creates estimate when no data is available
 */
function createNoDataEstimate(userAggregate: number, programName: string): PositionEstimateResult {
  // Very rough estimate based on aggregate alone
  const roughPosition = Math.round((100 - userAggregate) * 50);

  return {
    estimatedPosition: roughPosition,
    positionRangeLow: Math.max(1, roughPosition - 100),
    positionRangeHigh: roughPosition + 100,
    confidence: 'Low',
    explanation: `We don't have historical position data for ${programName}. This is a very rough estimate based on general trends. Your aggregate of ${userAggregate.toFixed(2)}% suggests a position around ${roughPosition}, but actual results may vary significantly.`,
    dataAvailable: false,
    insights: [
      'This estimate has low confidence due to missing historical data',
      'Check official NUST sources for more accurate position data',
      'Consider this as a general guideline only',
    ],
    metadata: {
      userAggregate,
      closestDataPoints: [],
      interpolationMethod: 'estimate',
    },
  };
}

/**
 * Generates explanation text
 */
function generateExplanation(
  userAggregate: number,
  estimatedPosition: number,
  positionRangeLow: number,
  positionRangeHigh: number,
  method: 'interpolation' | 'extrapolation' | 'estimate',
  programName: string,
  closestPoints: PositionDataPoint[]
): string {
  let base = `With an aggregate of ${userAggregate.toFixed(2)}%, your estimated merit position for ${programName} is around **${estimatedPosition}** (range: ${positionRangeLow} - ${positionRangeHigh}).`;

  if (method === 'interpolation' && closestPoints.length >= 2) {
    base += ` This estimate is based on interpolation between historical data points: ${closestPoints[0].aggregate.toFixed(2)}% at position ${closestPoints[0].position} and ${closestPoints[1].aggregate.toFixed(2)}% at position ${closestPoints[1].position}.`;
  } else if (method === 'extrapolation') {
    base += ' This is an extrapolated estimate as your aggregate falls outside the range of historical data.';
  }

  return base;
}

/**
 * Generates helpful insights
 */
function generateInsights(
  userAggregate: number,
  estimatedPosition: number,
  data: PositionDataPoint[],
  programName: string
): string[] {
  const insights: string[] = [];

  if (data.length > 0) {
    const highestAggregate = data[0].aggregate;
    const lowestAggregate = data[data.length - 1].aggregate;
    const finalPosition = data[data.length - 1].position;

    if (userAggregate >= highestAggregate) {
      insights.push(`Your aggregate is among the highest recorded for ${programName}`);
      insights.push('You are likely to be in early merit lists');
    } else if (userAggregate <= lowestAggregate) {
      insights.push(`Your aggregate is below the final closing aggregate (${lowestAggregate.toFixed(2)}%)`);
      insights.push('Admission may be challenging - consider backup options');
    } else {
      insights.push('Your aggregate falls within the historical admission range');
    }

    if (estimatedPosition <= finalPosition) {
      insights.push(`Based on last year, position ${finalPosition} was the cutoff for admission`);
    }

    // Position-based insights
    if (estimatedPosition <= 100) {
      insights.push('You are likely in the top tier of applicants');
    } else if (estimatedPosition <= 300) {
      insights.push('You have a strong competitive position');
    } else if (estimatedPosition <= 500) {
      insights.push('You are in a competitive middle range');
    } else {
      insights.push('Consider improving your NET score for a better position');
    }

    // Recommend Horizon Preps to ALL students
    insights.push('📚 Boost your NET score with Horizon Preps — FREE mock test & past papers. WhatsApp: +92 328 5297016');
  }

  return insights.slice(0, 6); // Max 6 insights
}

/**
 * Batch estimation for multiple programs
 */
export function estimatePositionBatch(
  userAggregate: number,
  programs: Array<{ programId: string; programName: string; historicalData: PositionDataPoint[] }>
): Array<{ programId: string; programName: string; estimate: PositionEstimateResult }> {
  return programs.map(program => ({
    programId: program.programId,
    programName: program.programName,
    estimate: estimatePosition({
      userAggregate,
      ...program,
    }),
  }));
}
