import { NextResponse } from 'next/server';
import { calculateAggregate, validateAggregateInput, type AggregateInput } from '@/lib/calcAggregate';

/**
 * POST /api/calculate-aggregate
 * 
 * Calculates NUST aggregate based on input scores.
 * 
 * Request body:
 * {
 *   netScore: number (0-200),
 *   hscPercentage: number (0-100),
 *   sscPercentage: number (0-100),
 *   useEquivalence?: boolean,
 *   equivalencePercentage?: number (0-100)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const input: AggregateInput = {
      netScore: body.netScore || 0,
      hscPercentage: body.hscPercentage || 0,
      sscPercentage: body.sscPercentage || 0,
      useEquivalence: body.useEquivalence || false,
      equivalencePercentage: body.equivalencePercentage,
    };

    // Validate input
    const validation = validateAggregateInput(input);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Calculate aggregate
    const result = calculateAggregate(input);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error calculating aggregate:', error);
    return NextResponse.json(
      { error: 'Failed to calculate aggregate' },
      { status: 500 }
    );
  }
}

