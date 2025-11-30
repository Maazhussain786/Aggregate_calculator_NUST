/**
 * Merit Data Import Script
 * 
 * Utility script to import historical merit data from CSV or JSON files.
 * 
 * Usage:
 *   npx ts-node scripts/importMeritData.ts <file-path> [--dry-run]
 * 
 * Supported formats:
 *   - JSON: Array of merit entries
 *   - CSV: Headers must match expected fields
 * 
 * Expected fields:
 *   - programCode: string (matches Program.code)
 *   - year: number
 *   - meritListNumber: number (optional)
 *   - closingMeritPosition: number (optional)
 *   - closingAggregate: number (optional)
 *   - sourceName: string
 *   - sourceUrl: string (optional)
 *   - notes: string (optional)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

interface MeritDataRow {
  programCode: string;
  year: number | string;
  meritListNumber?: number | string | null;
  closingMeritPosition?: number | string | null;
  closingAggregate?: number | string | null;
  sourceName: string;
  sourceUrl?: string | null;
  notes?: string | null;
}

interface ProgramDataRow {
  name: string;
  code: string;
  campus: string;
  school: string;
  disciplineGroup: string;
  degreeType: string;
  seats?: number | null;
  description?: string | null;
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

// ============================================
// Parsers
// ============================================

/**
 * Parses CSV content to array of objects
 */
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parses JSON content
 */
function parseJSON(content: string): MeritDataRow[] | ProgramDataRow[] {
  return JSON.parse(content);
}

/**
 * Detects file type and parses content
 */
function parseFile(filePath: string): MeritDataRow[] | ProgramDataRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return parseJSON(content);
  } else if (ext === '.csv') {
    return parseCSV(content) as unknown as MeritDataRow[];
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

// ============================================
// Import Functions
// ============================================

/**
 * Imports merit history data
 */
async function importMeritData(
  data: MeritDataRow[],
  dryRun: boolean = false
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Get all programs for code lookup
  const programs = await prisma.program.findMany();
  const programCodeMap = new Map(programs.map(p => [p.code, p.id]));

  console.log(`\nFound ${programs.length} programs in database`);
  console.log(`Processing ${data.length} merit entries...\n`);

  for (const row of data) {
    try {
      // Find program by code
      const programId = programCodeMap.get(row.programCode);
      if (!programId) {
        result.skipped++;
        result.errors.push(`Program not found: ${row.programCode}`);
        continue;
      }

      const meritData = {
        programId,
        year: parseInt(String(row.year)),
        meritListNumber: row.meritListNumber ? parseInt(String(row.meritListNumber)) : null,
        closingMeritPosition: row.closingMeritPosition ? parseInt(String(row.closingMeritPosition)) : null,
        closingAggregate: row.closingAggregate ? parseFloat(String(row.closingAggregate)) : null,
        sourceName: row.sourceName,
        sourceUrl: row.sourceUrl || null,
        notes: row.notes || null,
      };

      if (dryRun) {
        console.log(`[DRY RUN] Would create:`, meritData);
        result.success++;
      } else {
        // Upsert (update if exists, create if not)
        await prisma.meritHistory.upsert({
          where: {
            programId_year_meritListNumber: {
              programId: meritData.programId,
              year: meritData.year,
              meritListNumber: meritData.meritListNumber ?? 0,
            },
          },
          update: {
            closingMeritPosition: meritData.closingMeritPosition,
            closingAggregate: meritData.closingAggregate,
            sourceName: meritData.sourceName,
            sourceUrl: meritData.sourceUrl,
            notes: meritData.notes,
          },
          create: meritData,
        });
        result.success++;
        console.log(`✓ Imported: ${row.programCode} - ${row.year} (List ${row.meritListNumber || 'Final'})`);
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Error processing ${row.programCode}: ${error}`);
    }
  }

  return result;
}

/**
 * Imports program data
 */
async function importPrograms(
  data: ProgramDataRow[],
  dryRun: boolean = false
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`Processing ${data.length} programs...\n`);

  for (const row of data) {
    try {
      const programData = {
        name: row.name,
        code: row.code,
        campus: row.campus,
        school: row.school,
        disciplineGroup: row.disciplineGroup,
        degreeType: row.degreeType,
        seats: row.seats ? parseInt(String(row.seats)) : null,
        description: row.description || null,
      };

      if (dryRun) {
        console.log(`[DRY RUN] Would create program:`, programData);
        result.success++;
      } else {
        await prisma.program.upsert({
          where: { code: programData.code },
          update: programData,
          create: programData,
        });
        result.success++;
        console.log(`✓ Imported program: ${row.name} (${row.code})`);
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`Error processing ${row.code}: ${error}`);
    }
  }

  return result;
}

// ============================================
// Main CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
NUST Merit Data Import Tool
===========================

Usage:
  npx ts-node scripts/importMeritData.ts <file-path> [options]

Options:
  --dry-run     Preview changes without saving to database
  --programs    Import programs instead of merit data

File formats:
  - JSON: Array of objects with required fields
  - CSV: Headers matching required fields

Example JSON (merit data):
[
  {
    "programCode": "SEECS-CS",
    "year": 2024,
    "meritListNumber": 1,
    "closingAggregate": 82.5,
    "closingMeritPosition": 380,
    "sourceName": "Official NUST"
  }
]

Example JSON (programs):
[
  {
    "name": "BS Computer Science",
    "code": "SEECS-CS",
    "campus": "H-12 Islamabad",
    "school": "SEECS",
    "disciplineGroup": "Engineering/CS",
    "degreeType": "BS",
    "seats": 150
  }
]
    `);
    process.exit(0);
  }

  const filePath = args[0];
  const dryRun = args.includes('--dry-run');
  const isPrograms = args.includes('--programs');

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`NUST Merit Data Import Tool`);
  console.log(`${'='.repeat(50)}`);
  console.log(`File: ${filePath}`);
  console.log(`Mode: ${isPrograms ? 'Programs' : 'Merit Data'}`);
  console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log(`${'='.repeat(50)}\n`);

  try {
    const data = parseFile(filePath);
    
    let result: ImportResult;
    if (isPrograms) {
      result = await importPrograms(data as ProgramDataRow[], dryRun);
    } else {
      result = await importMeritData(data as MeritDataRow[], dryRun);
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Import Summary`);
    console.log(`${'='.repeat(50)}`);
    console.log(`✓ Success: ${result.success}`);
    console.log(`✗ Failed: ${result.failed}`);
    console.log(`⊘ Skipped: ${result.skipped}`);
    
    if (result.errors.length > 0) {
      console.log(`\nErrors:`);
      result.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    console.log(`${'='.repeat(50)}\n`);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

