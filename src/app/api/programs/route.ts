import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import sampleData from '@/data/sampleMeritData.json';

/**
 * GET /api/programs
 * 
 * Fetches all programs from the database.
 * Falls back to sample data if database is empty.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campus = searchParams.get('campus');
    const school = searchParams.get('school');
    const disciplineGroup = searchParams.get('disciplineGroup');

    // Build where clause
    const where: Record<string, string> = {};
    if (campus) where.campus = campus;
    if (school) where.school = school;
    if (disciplineGroup) where.disciplineGroup = disciplineGroup;

    // Try to fetch from database
    let programs = await prisma.program.findMany({
      where,
      orderBy: [
        { campus: 'asc' },
        { school: 'asc' },
        { name: 'asc' },
      ],
    });

    // Fall back to sample data if database is empty
    if (programs.length === 0) {
      programs = sampleData.programs
        .filter(p => {
          if (campus && p.campus !== campus) return false;
          if (school && p.school !== school) return false;
          if (disciplineGroup && p.disciplineGroup !== disciplineGroup) return false;
          return true;
        })
        .map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          campus: p.campus,
          school: p.school,
          disciplineGroup: p.disciplineGroup,
          degreeType: p.degreeType,
          seats: p.seats,
          description: p.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
    }

    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    
    // Return sample data on error
    return NextResponse.json({ 
      programs: sampleData.programs,
      source: 'sample',
    });
  }
}

