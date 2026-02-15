import { NextResponse } from 'next/server';
import { predictChance } from '@/lib/chancePredictor';
import { predictMeritList, generateThresholdsFromHistory, generateEstimatedThresholds, type MeritListThreshold } from '@/lib/meritListPredictor';
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

    // Get all merit data for this program from the latest year
    // Note: ACF (nbs-bsaf), BBA (nbs-bba), and Tourism (nbs-bsth) share the same Business NET.
    // Their aggregate-to-position curve is the same, but closing positions differ per program.
    // ACF aggregate data has been corrected to match BBA's curve.
    const programMeritHistory = sampleData.meritHistory.filter(m => m.programId === programId);
    const latestYear = Math.max(...programMeritHistory.map(m => m.year));
    const latestYearHistory = programMeritHistory
      .filter(m => m.year === latestYear)
      .map(m => ({
        meritListNumber: m.meritListNumber,
        closingAggregate: m.closingAggregate,
        closingMeritPosition: m.closingMeritPosition,
      }));

    // Get latest merit data for chance prediction
    const meritData = latestYearHistory.find(m => m.meritListNumber === 1 || m.meritListNumber === null)
      ?? latestYearHistory[0];

    const lastYearClosingAggregate = meritData?.closingAggregate ?? null;

    // Chance prediction
    const chancePrediction = predictChance({
      userAggregate,
      programId,
      programName: program.name,
      lastYearClosingAggregate,
    });

    // Merit list prediction - use real historical data
    let thresholds: MeritListThreshold[];
    if (latestYearHistory.length > 0) {
      thresholds = generateThresholdsFromHistory(latestYearHistory);
    } else if (lastYearClosingAggregate) {
      thresholds = generateEstimatedThresholds(lastYearClosingAggregate);
    } else {
      thresholds = [];
    }
    
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

