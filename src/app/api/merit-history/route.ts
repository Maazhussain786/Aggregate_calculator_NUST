import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import sampleData from '@/data/sampleMeritData.json';

/**
 * GET /api/merit-history
 * 
 * Fetches merit history data.
 * Supports filtering by programId, year, and meritListNumber.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');
    const year = searchParams.get('year');
    const meritListNumber = searchParams.get('meritListNumber');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (programId) where.programId = programId;
    if (year) where.year = parseInt(year);
    if (meritListNumber) where.meritListNumber = parseInt(meritListNumber);

    // Try to fetch from database
    let meritHistory = await prisma.meritHistory.findMany({
      where,
      include: {
        program: {
          select: {
            name: true,
            code: true,
            campus: true,
            school: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { meritListNumber: 'asc' },
      ],
    });

    // Fall back to sample data if database is empty
    if (meritHistory.length === 0) {
      const filteredSample = sampleData.meritHistory
        .filter(m => {
          if (programId && m.programId !== programId) return false;
          if (year && m.year !== parseInt(year)) return false;
          if (meritListNumber && m.meritListNumber !== parseInt(meritListNumber)) return false;
          return true;
        })
        .map(m => {
          const program = sampleData.programs.find(p => p.id === m.programId);
          return {
            id: `${m.programId}-${m.year}-${m.meritListNumber}`,
            programId: m.programId,
            year: m.year,
            meritListNumber: m.meritListNumber,
            closingMeritPosition: m.closingMeritPosition,
            closingAggregate: m.closingAggregate,
            sourceName: m.sourceName,
            sourceUrl: null,
            notes: m.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            program: program ? {
              name: program.name,
              code: program.code,
              campus: program.campus,
              school: program.school,
            } : null,
          };
        });

      return NextResponse.json({ 
        meritHistory: filteredSample,
        source: 'sample',
      });
    }

    return NextResponse.json({ meritHistory });
  } catch (error) {
    console.error('Error fetching merit history:', error);
    
    // Return sample data on error
    return NextResponse.json({ 
      meritHistory: sampleData.meritHistory,
      source: 'sample',
    });
  }
}

