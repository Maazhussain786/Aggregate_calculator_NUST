import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import MeritHistoryClient from './MeritHistoryClient';
import MeritPdfDownload from '@/components/MeritPdfDownload';
import sampleData from '@/data/sampleMeritData.json';
import type { MeritListPage } from '@/lib/meritPdfGenerator';

export const metadata: Metadata = {
  title: 'NUST Merit History & Closing Merits | All Programs',
  description: 'Explore NUST historical merit data, closing aggregates, and merit positions for all programs. SEECS, SMME, NBS, and more. Year-wise trends from 2020-2024.',
  keywords: [
    'NUST merit history',
    'NUST closing merit',
    'NUST cutoff',
    'NUST SEECS merit',
    'NUST merit list history',
    'NUST program merits',
  ],
  alternates: {
    canonical: '/merit-history',
  },
};

// Transform sample data for the client component
function transformData() {
  const programs = sampleData.programs.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
    campus: p.campus,
    school: p.school,
    disciplineGroup: p.disciplineGroup,
    degreeType: p.degreeType,
    seats: p.seats,
  }));

  const meritHistory = sampleData.meritHistory.map(m => ({
    programId: m.programId,
    year: m.year,
    meritListNumber: m.meritListNumber,
    closingMeritPosition: m.closingMeritPosition,
    closingAggregate: m.closingAggregate,
    sourceName: m.sourceName,
    notes: m.notes || null,
  }));

  return { programs, meritHistory };
}

/**
 * Parse a merit CSV (5 cols: Discipline,School,List_Number,Merit_Position,Aggregate)
 * into structured pages grouped by list number.
 */
function parseCompleteMeritCSV(filename: string): MeritListPage[] {
  try {
    const csvPath = path.join(process.cwd(), filename);
    if (!fs.existsSync(csvPath)) return [];
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(',');
      return {
        discipline: parts[0]?.trim() ?? '',
        school: parts[1]?.trim() ?? '',
        listNumber: parts[2]?.trim() ?? '',
        meritPosition: parseInt(parts[3]?.trim() ?? '0', 10),
        aggregate: parseFloat(parts[4]?.trim() ?? '0'),
      };
    });

    const listOrder = ['1','2','3','4','5','6','7','8','9','10','11','Final'];
    return listOrder
      .map((ln) => ({
        listNumber: ln,
        programs: rows
          .filter((r) => r.listNumber === ln)
          .map((r) => ({
            discipline: r.discipline,
            school: r.school,
            meritPosition: r.meritPosition,
            aggregate: r.aggregate,
          }))
          .sort((a, b) => a.discipline.localeCompare(b.discipline)),
      }))
      .filter((ml) => ml.programs.length > 0);
  } catch {
    return [];
  }
}

/**
 * Parse a 2024-format CSV (6 cols: Category,Discipline,School,List_Number,Merit_Position,Aggregate)
 */
function parseMeritCSV2024(filename: string): MeritListPage[] {
  try {
    const csvPath = path.join(process.cwd(), filename);
    if (!fs.existsSync(csvPath)) return [];
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    const rows = lines.slice(1).map((line) => {
      const parts = line.split(',');
      return {
        discipline: parts[1]?.trim() ?? '',
        school: parts[2]?.trim() ?? '',
        listNumber: parts[3]?.trim() ?? '',
        meritPosition: parseInt(parts[4]?.trim() ?? '0', 10),
        aggregate: parseFloat(parts[5]?.trim() ?? '0'),
      };
    });

    const listOrder = ['1','2','3','4','5','6','7','8','9','10','11','Final'];
    return listOrder
      .map((ln) => ({
        listNumber: ln,
        programs: rows
          .filter((r) => r.listNumber === ln)
          .map((r) => ({
            discipline: r.discipline,
            school: r.school,
            meritPosition: r.meritPosition,
            aggregate: r.aggregate,
          }))
          .sort((a, b) => a.discipline.localeCompare(b.discipline)),
      }))
      .filter((ml) => ml.programs.length > 0);
  } catch {
    return [];
  }
}

export default function MeritHistoryPage() {
  const { programs, meritHistory } = transformData();

  // Build available years for the PDF download filter
  const data2025 = parseCompleteMeritCSV('NUST_Merit_List_2025_Final_Format.csv');
  const data2024 = parseMeritCSV2024('nust_merit_list_2024_with_aggregates.csv');

  const availableYears = [
    ...(data2025.length > 0 ? [{ year: 2025, lists: data2025 }] : []),
    ...(data2024.length > 0 ? [{ year: 2024, lists: data2024 }] : []),
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            NUST Merit History & Closing Merits
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Explore historical closing aggregates and merit positions for all NUST programs. 
            Track trends and make informed decisions.
          </p>

        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MeritHistoryClient 
            programs={programs} 
            meritHistory={meritHistory} 
          />
        </div>
      </section>

      {/* PDF Download */}
      {availableYears.length > 0 && (
        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <MeritPdfDownload availableYears={availableYears} />
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Understanding NUST Merit Lists
          </h2>
          
          <div className="space-y-6 text-[var(--text-secondary)]">
            <p>
              NUST releases multiple merit lists during each admission cycle, typically 6-8 lists. 
              The <strong className="text-[var(--text-primary)]">1st merit list</strong> has the highest cutoffs, 
              with subsequent lists having progressively lower requirements as seats are filled.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm">
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">Closing Aggregate</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  The minimum aggregate percentage of the last candidate admitted in a merit list. 
                  Higher closing aggregates indicate more competitive programs.
                </p>
              </div>
              <div className="p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm">
                <h3 className="text-[var(--text-primary)] font-semibold mb-2">Closing Position</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  The merit position of the last admitted candidate. This helps understand 
                  how many students were ahead of the cutoff.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[var(--warning-light)] border border-[var(--warning)] rounded-xl">
              <p className="text-sm text-[var(--warning)]">
                <strong>Note:</strong> Historical data is provided for reference only. 
                Actual cutoffs vary each year based on applicant pool, seat availability, 
                and other factors. Always verify with official NUST sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            NUST Programs and Campuses
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            NUST offers undergraduate programs across multiple campuses including H-12 Islamabad, 
            Rawalpindi, and Karachi. Popular programs include Computer Science and Software Engineering 
            at SEECS, Mechanical Engineering at SMME, and Business programs at NBS.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {['SEECS', 'SMME', 'NBS', 'S3H', 'SNS', 'NICE', 'PNEC'].map((school) => (
              <span 
                key={school}
                className="px-3 py-1 bg-[var(--accent-light)] text-[var(--accent-primary)] text-sm rounded-full font-medium"
              >
                {school}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

