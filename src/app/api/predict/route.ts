import { NextResponse } from 'next/server';
import { predictChance } from '@/lib/chancePredictor';
import { predictMeritList, generateEstimatedThresholds } from '@/lib/meritListPredictor';
import { getNetScoreRecommendation } from '@/lib/netScoreRecommender';
import sampleData from '@/data/sampleMeritData.json';

/**
 * POST /api/predict
 * 
 * Predicts admission chances and merit list.
 * 
 * Request body:
 * {
 *   userAggregate: number,
 *   programId: string,
 *   hscPercentage?: number (for NET recommendation),
 *   sscPercentage?: number (for NET recommendation)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { userAggregate, programId, hscPercentage, sscPercentage } = body;

    if (!userAggregate || !programId) {
      return NextResponse.json(
        { error: 'userAggregate and programId are required' },
        { status: 400 }
      );
    }

    // Get program info from sample data (replace with DB lookup later)
    const program = sampleData.programs.find(p => p.id === programId);
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Get latest merit data
    const meritData = sampleData.meritHistory
      .filter(m => m.programId === programId)
      .sort((a, b) => b.year - a.year)[0];

    const lastYearClosingAggregate = meritData?.closingAggregate ?? null;

    // Chance prediction
    const chancePrediction = predictChance({
      userAggregate,
      programId,
      programName: program.name,
      lastYearClosingAggregate,
    });

    // Merit list prediction
    const thresholds = lastYearClosingAggregate
      ? generateEstimatedThresholds(lastYearClosingAggregate)
      : [];
    
    const meritListPrediction = predictMeritList({
      userAggregate,
      programId,
      programName: program.name,
      thresholds,
    });

    // NET score recommendation (if academic scores provided)
    let netRecommendation = null;
    if (hscPercentage && sscPercentage && lastYearClosingAggregate) {
      netRecommendation = getNetScoreRecommendation({
        programName: program.name,
        lastYearClosingAggregate,
        hscPercentage,
        sscPercentage,
      });
    }

    return NextResponse.json({
      success: true,
      program: {
        id: program.id,
        name: program.name,
        campus: program.campus,
        school: program.school,
      },
      lastYearClosingAggregate,
      chancePrediction,
      meritListPrediction,
      netRecommendation,
    });
  } catch (error) {
    console.error('Error predicting admission:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}

