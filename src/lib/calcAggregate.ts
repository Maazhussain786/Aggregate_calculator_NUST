/**
 * NUST Aggregate Calculator
 * 
 * This module implements the official NUST merit formula:
 * 
 * FOR FSC STUDENTS:
 * - NET Score: 75%
 * - FSc/HSSC: 15%
 * - SSC/Matric: 10%
 * 
 * FOR O/A LEVEL STUDENTS:
 * - NET Score: 75%
 * - O-Level Equivalence: 25%
 * 
 * Total aggregate is calculated as a percentage out of 100.
 */

// ============================================
// Types & Interfaces
// ============================================

export interface AggregateInput {
  /** NET exam score (out of 200) */
  netScore: number;
  /** FSc/HSSC percentage or marks (for FSc students) */
  hscPercentage: number;
  /** Matric/SSC percentage or marks (for FSc students) */
  sscPercentage: number;
  /** Whether student is O/A Level */
  useEquivalence?: boolean;
  /** Equivalence percentage (for O/A Level students) - this covers the full 25% */
  equivalencePercentage?: number;
}

export interface AggregateBreakdown {
  /** NET contribution (75% weight) */
  netContribution: number;
  /** HSC/FSc contribution (15% weight for FSc, 0 for O/A Level) */
  hscContribution: number;
  /** SSC/Matric contribution (10% weight for FSc, 0 for O/A Level) */
  sscContribution: number;
  /** Equivalence contribution (25% weight for O/A Level, 0 for FSc) */
  equivalenceContribution?: number;
  /** Final aggregate percentage */
  totalAggregate: number;
  /** Detailed explanation */
  explanation: string;
  /** Whether O/A Level formula was used */
  isOALevel: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================
// Constants (Configurable)
// ============================================

export const AGGREGATE_CONFIG = {
  /** Maximum NET score */
  MAX_NET_SCORE: 200,
  
  /** Weightages for FSc students */
  WEIGHTS_FSC: {
    NET: 0.75,      // 75%
    HSC: 0.15,      // 15%
    SSC: 0.10,      // 10%
  },
  
  /** Weightages for O/A Level students */
  WEIGHTS_OA_LEVEL: {
    NET: 0.75,           // 75%
    EQUIVALENCE: 0.25,   // 25% (replaces both HSC and SSC)
  },
  
  /** Score boundaries */
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
} as const;

// ============================================
// Validation Functions
// ============================================

/**
 * Validates the input for aggregate calculation
 */
export function validateAggregateInput(input: AggregateInput): ValidationResult {
  const errors: string[] = [];

  // Validate NET score
  if (input.netScore < 0) {
    errors.push('NET score cannot be negative');
  }
  if (input.netScore > AGGREGATE_CONFIG.MAX_NET_SCORE) {
    errors.push(`NET score cannot exceed ${AGGREGATE_CONFIG.MAX_NET_SCORE}`);
  }

  if (input.useEquivalence) {
    // O/A Level validation
    if (input.equivalencePercentage === undefined || input.equivalencePercentage === null) {
      errors.push('Equivalence percentage is required for O/A Level students');
    } else {
      if (input.equivalencePercentage < AGGREGATE_CONFIG.MIN_PERCENTAGE) {
        errors.push('Equivalence percentage cannot be negative');
      }
      if (input.equivalencePercentage > AGGREGATE_CONFIG.MAX_PERCENTAGE) {
        errors.push('Equivalence percentage cannot exceed 100%');
      }
    }
  } else {
    // FSc validation
    if (input.hscPercentage < AGGREGATE_CONFIG.MIN_PERCENTAGE) {
      errors.push('HSC/FSc percentage cannot be negative');
    }
    if (input.hscPercentage > AGGREGATE_CONFIG.MAX_PERCENTAGE) {
      errors.push('HSC/FSc percentage cannot exceed 100%');
    }

    if (input.sscPercentage < AGGREGATE_CONFIG.MIN_PERCENTAGE) {
      errors.push('SSC/Matric percentage cannot be negative');
    }
    if (input.sscPercentage > AGGREGATE_CONFIG.MAX_PERCENTAGE) {
      errors.push('SSC/Matric percentage cannot exceed 100%');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// Core Calculation Functions
// ============================================

/**
 * Converts NET score (out of 200) to percentage
 */
export function netScoreToPercentage(netScore: number): number {
  return (netScore / AGGREGATE_CONFIG.MAX_NET_SCORE) * 100;
}

/**
 * Calculates the NUST aggregate based on official formula
 * 
 * FOR FSC STUDENTS:
 * Aggregate = (NET% × 0.75) + (HSC% × 0.15) + (SSC% × 0.10)
 * 
 * FOR O/A LEVEL STUDENTS:
 * Aggregate = (NET% × 0.75) + (Equivalence% × 0.25)
 */
export function calculateAggregate(input: AggregateInput): AggregateBreakdown {
  // Convert NET score to percentage
  const netPercentage = netScoreToPercentage(input.netScore);

  if (input.useEquivalence && input.equivalencePercentage !== undefined) {
    // O/A Level formula
    const { WEIGHTS_OA_LEVEL } = AGGREGATE_CONFIG;
    
    const netContribution = netPercentage * WEIGHTS_OA_LEVEL.NET;
    const equivalenceContribution = input.equivalencePercentage * WEIGHTS_OA_LEVEL.EQUIVALENCE;
    const totalAggregate = netContribution + equivalenceContribution;

    const explanation = generateOALevelExplanation(
      input.netScore,
      netPercentage,
      input.equivalencePercentage,
      netContribution,
      equivalenceContribution,
      totalAggregate
    );

    return {
      netContribution: parseFloat(netContribution.toFixed(2)),
      hscContribution: 0,
      sscContribution: 0,
      equivalenceContribution: parseFloat(equivalenceContribution.toFixed(2)),
      totalAggregate: parseFloat(totalAggregate.toFixed(2)),
      explanation,
      isOALevel: true,
    };
  } else {
    // FSc formula
    const { WEIGHTS_FSC } = AGGREGATE_CONFIG;
    
    const netContribution = netPercentage * WEIGHTS_FSC.NET;
    const hscContribution = input.hscPercentage * WEIGHTS_FSC.HSC;
    const sscContribution = input.sscPercentage * WEIGHTS_FSC.SSC;
    const totalAggregate = netContribution + hscContribution + sscContribution;

    const explanation = generateFScExplanation(
      input.netScore,
      netPercentage,
      input.hscPercentage,
      input.sscPercentage,
      netContribution,
      hscContribution,
      sscContribution,
      totalAggregate
    );

    return {
      netContribution: parseFloat(netContribution.toFixed(2)),
      hscContribution: parseFloat(hscContribution.toFixed(2)),
      sscContribution: parseFloat(sscContribution.toFixed(2)),
      totalAggregate: parseFloat(totalAggregate.toFixed(2)),
      explanation,
      isOALevel: false,
    };
  }
}

/**
 * Generates explanation for FSc students
 */
function generateFScExplanation(
  netScore: number,
  netPercentage: number,
  hscPercentage: number,
  sscPercentage: number,
  netContribution: number,
  hscContribution: number,
  sscContribution: number,
  totalAggregate: number
): string {
  return `
Your NUST Aggregate (FSc Formula):

📊 NET Score: ${netScore}/200 = ${netPercentage.toFixed(2)}%
   Contribution (75%): ${netPercentage.toFixed(2)} × 0.75 = ${netContribution.toFixed(2)}

📚 FSc/HSSC: ${hscPercentage.toFixed(2)}%
   Contribution (15%): ${hscPercentage.toFixed(2)} × 0.15 = ${hscContribution.toFixed(2)}

📝 SSC/Matric: ${sscPercentage.toFixed(2)}%
   Contribution (10%): ${sscPercentage.toFixed(2)} × 0.10 = ${sscContribution.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Total Aggregate: ${totalAggregate.toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

/**
 * Generates explanation for O/A Level students
 */
function generateOALevelExplanation(
  netScore: number,
  netPercentage: number,
  equivalencePercentage: number,
  netContribution: number,
  equivalenceContribution: number,
  totalAggregate: number
): string {
  return `
Your NUST Aggregate (O/A Level Formula):

📊 NET Score: ${netScore}/200 = ${netPercentage.toFixed(2)}%
   Contribution (75%): ${netPercentage.toFixed(2)} × 0.75 = ${netContribution.toFixed(2)}

📚 O-Level Equivalence: ${equivalencePercentage.toFixed(2)}%
   Contribution (25%): ${equivalencePercentage.toFixed(2)} × 0.25 = ${equivalenceContribution.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Total Aggregate: ${totalAggregate.toFixed(2)}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

// ============================================
// Reverse Calculation (NET Score Requirement)
// ============================================

/**
 * Calculates the required NET score to achieve a target aggregate
 * 
 * FOR FSC:
 * NET% = (Target - HSC×0.15 - SSC×0.10) / 0.75
 * 
 * FOR O/A LEVEL:
 * NET% = (Target - Equivalence×0.25) / 0.75
 */
export function calculateRequiredNetScore(
  targetAggregate: number,
  hscPercentage: number,
  sscPercentage: number,
  useEquivalence: boolean = false,
  equivalencePercentage?: number
): { requiredNetScore: number; requiredNetPercentage: number; achievable: boolean } {
  const { MAX_NET_SCORE, WEIGHTS_FSC, WEIGHTS_OA_LEVEL } = AGGREGATE_CONFIG;

  let requiredNetPercentage: number;

  if (useEquivalence && equivalencePercentage !== undefined) {
    const equivalenceContribution = equivalencePercentage * WEIGHTS_OA_LEVEL.EQUIVALENCE;
    requiredNetPercentage = (targetAggregate - equivalenceContribution) / WEIGHTS_OA_LEVEL.NET;
  } else {
    const hscContribution = hscPercentage * WEIGHTS_FSC.HSC;
    const sscContribution = sscPercentage * WEIGHTS_FSC.SSC;
    requiredNetPercentage = (targetAggregate - hscContribution - sscContribution) / WEIGHTS_FSC.NET;
  }
  
  const requiredNetScore = (requiredNetPercentage / 100) * MAX_NET_SCORE;
  const achievable = requiredNetScore >= 0 && requiredNetScore <= MAX_NET_SCORE;

  return {
    requiredNetScore: Math.max(0, Math.min(MAX_NET_SCORE, Math.ceil(requiredNetScore))),
    requiredNetPercentage: parseFloat(Math.max(0, Math.min(100, requiredNetPercentage)).toFixed(2)),
    achievable,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Formats aggregate for display
 */
export function formatAggregate(aggregate: number): string {
  return `${aggregate.toFixed(2)}%`;
}

/**
 * Gets aggregate category based on value
 */
export function getAggregateCategory(aggregate: number): {
  category: 'Excellent' | 'Good' | 'Average' | 'Below Average';
  color: string;
} {
  if (aggregate >= 80) {
    return { category: 'Excellent', color: 'text-green-600' };
  } else if (aggregate >= 70) {
    return { category: 'Good', color: 'text-blue-600' };
  } else if (aggregate >= 60) {
    return { category: 'Average', color: 'text-yellow-600' };
  } else {
    return { category: 'Below Average', color: 'text-red-600' };
  }
}
