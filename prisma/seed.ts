/**
 * Database Seed Script
 * 
 * Populates the database with sample data for development and testing.
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Load sample data
const sampleDataPath = path.join(__dirname, '../src/data/sampleMeritData.json');
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));

interface ProgramData {
  id: string;
  name: string;
  code: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  degreeType: string;
  seats: number;
  description: string;
}

interface MeritData {
  programId: string;
  year: number;
  meritListNumber: number | null;
  closingMeritPosition: number | null;
  closingAggregate: number | null;
  sourceName: string;
  notes?: string;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.userCrowdData.deleteMany();
  await prisma.meritHistory.deleteMany();
  await prisma.program.deleteMany();
  console.log('✓ Cleared existing data\n');

  // Seed Programs
  console.log('Seeding programs...');
  const programIdMap: Record<string, string> = {};
  
  for (const program of sampleData.programs as ProgramData[]) {
    const created = await prisma.program.create({
      data: {
        name: program.name,
        code: program.code,
        campus: program.campus,
        school: program.school,
        disciplineGroup: program.disciplineGroup,
        degreeType: program.degreeType,
        seats: program.seats,
        description: program.description,
      },
    });
    programIdMap[program.id] = created.id;
    console.log(`  ✓ Created program: ${program.name}`);
  }
  console.log(`\n✓ Seeded ${sampleData.programs.length} programs\n`);

  // Seed Merit History
  console.log('Seeding merit history...');
  let meritCount = 0;
  
  for (const merit of sampleData.meritHistory as MeritData[]) {
    const programId = programIdMap[merit.programId];
    if (!programId) {
      console.warn(`  ⚠ Skipping merit entry - program not found: ${merit.programId}`);
      continue;
    }

    await prisma.meritHistory.create({
      data: {
        programId,
        year: merit.year,
        meritListNumber: merit.meritListNumber,
        closingMeritPosition: merit.closingMeritPosition,
        closingAggregate: merit.closingAggregate,
        sourceName: merit.sourceName,
        notes: merit.notes || null,
      },
    });
    meritCount++;
  }
  console.log(`✓ Seeded ${meritCount} merit history entries\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const programCount = await prisma.program.count();
  const meritHistoryCount = await prisma.meritHistory.count();
  
  console.log(`📊 Summary:`);
  console.log(`   - Programs: ${programCount}`);
  console.log(`   - Merit History Entries: ${meritHistoryCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
