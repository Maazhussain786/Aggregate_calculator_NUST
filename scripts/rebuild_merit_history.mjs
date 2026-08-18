/**
 * Rebuilds the finished admission cycles in `src/data/sampleMeritData.json`
 * from the official merit-list CSVs that ship with the repo.
 *
 * The site used to carry a hand-picked 1st/3rd/Final subset of each cycle, and
 * it had drifted badly: every "3rd list" row actually held the *7th* list's
 * closing figures, so the page told applicants a program closed thousands of
 * positions deeper than it really had at that stage. The CSVs are the same
 * files the merit-list PDF export is generated from, so making them the single
 * source of truth keeps the page, the PDF and the predictors telling one story.
 *
 * Run with `node scripts/rebuild_merit_history.mjs`. It is idempotent: the 2026
 * cycle (published list by list, straight into the JSON) is left untouched, as
 * is any program a CSV does not cover.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_PATH = path.join(ROOT, 'src/data/sampleMeritData.json');

/** Cycles that live in the CSVs. Anything newer is maintained in the JSON. */
const SOURCES = [
  { year: 2024, file: 'nust_merit_list_2024_with_aggregates.csv', cols: { disc: 1, school: 2, list: 3, pos: 4, agg: 5 } },
  { year: 2025, file: 'NUST_Merit_List_2025_Final_Format.csv', cols: { disc: 0, school: 1, list: 2, pos: 3, agg: 4 } },
];

/**
 * The CSVs name a few programs differently to the site, and a couple moved
 * school between cycles. Everything else matches once the degree prefix and
 * punctuation are normalised away.
 */
const DISCIPLINE_ALIASES = {
  'food science and technology': 'food science',
  'environmental sciences': 'environmental science',
};
const SCHOOL_ALIASES = { eme: 'ceme' };
/** programId -> CSV key, for the cases no rule can reach. */
const KEY_OVERRIDES = {
  // LLB was published under S3H in 2024 and under the new NLS in 2025.
  'nls-llb': { 2024: 'llb||s3h' },
};

function normalise(value) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * A CSV row and a site program agree on the program's *name*, not its degree
 * prefix — the lists file Software Engineering as "BE" one year and "BS" the
 * next. The prefix is dropped; nothing else is, so "environmental engineering"
 * stays distinct from "environmental science".
 */
function csvKey(discipline, school) {
  const name = normalise(discipline).replace(/^b[es] /, '');
  const schoolName = normalise(school);
  return `${DISCIPLINE_ALIASES[name] ?? name}||${SCHOOL_ALIASES[schoolName] ?? schoolName}`;
}

function keyFor(program, year) {
  return KEY_OVERRIDES[program.id]?.[year] ?? csvKey(program.name, program.school);
}

function parseCsv({ file, cols }) {
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf-8').trim().split('\n');
  const byProgram = new Map();

  for (const line of lines.slice(1)) {
    const parts = line.split(',');
    const key = csvKey((parts[cols.disc] ?? '').trim(), (parts[cols.school] ?? '').trim());
    const list = (parts[cols.list] ?? '').trim();
    const pos = (parts[cols.pos] ?? '').trim();
    const agg = (parts[cols.agg] ?? '').trim();
    if (!list) continue;

    if (!byProgram.has(key)) byProgram.set(key, []);
    byProgram.get(key).push({
      meritListNumber: list === 'Final' ? null : parseInt(list, 10),
      closingMeritPosition: pos ? parseInt(pos, 10) : null,
      // NUST publishes positions before aggregates; an empty cell means the
      // aggregate was never released, not that it is zero.
      closingAggregate: agg ? parseFloat(agg) : null,
    });
  }

  // Numbered lists in order, Final last.
  const order = (n) => (n === null ? Infinity : n);
  for (const rows of byProgram.values()) {
    rows.sort((a, b) => order(a.meritListNumber) - order(b.meritListNumber));
  }
  return byProgram;
}

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
const csvByYear = new Map(SOURCES.map((source) => [source.year, parseCsv(source)]));
const rebuiltYears = new Set(SOURCES.map((s) => s.year));

const rebuilt = [];
const skipped = [];
const added = [];
const generated = [];
/** `${programId}|${year}` pairs the CSVs own; their old rows are dropped. */
const regenerated = new Set();

for (const program of data.programs) {
  for (const { year } of SOURCES) {
    const rows = csvByYear.get(year).get(keyFor(program, year));
    const existing = data.meritHistory.filter((m) => m.programId === program.id && m.year === year);

    if (!rows) {
      if (existing.length) skipped.push(`${program.id} ${year} (${existing.length} rows kept, no CSV entry)`);
      continue;
    }

    regenerated.add(`${program.id}|${year}`);
    if (existing.length) rebuilt.push(`${program.id} ${year} (${existing.length} -> ${rows.length} rows)`);
    else added.push(`${program.id} ${year} (+${rows.length} rows)`);

    for (const row of rows) {
      generated.push({
        programId: program.id,
        year,
        meritListNumber: row.meritListNumber,
        closingMeritPosition: row.closingMeritPosition,
        closingAggregate: row.closingAggregate,
        sourceName: 'NUST Official',
        ...(row.meritListNumber === null ? { notes: 'Final List' } : {}),
      });
    }
  }
}

// Everything the CSVs do not own — the 2026 cycle, and any program they miss —
// is carried through untouched.
const carried = data.meritHistory.filter((m) => !regenerated.has(`${m.programId}|${m.year}`));

// Grouped by program, oldest cycle first, so the file still reads in the order
// the site presents it.
const programOrder = new Map(data.programs.map((p, i) => [p.id, i]));
data.meritHistory = [...generated, ...carried].sort((a, b) => {
  const byProgram = (programOrder.get(a.programId) ?? Infinity) - (programOrder.get(b.programId) ?? Infinity);
  if (byProgram !== 0) return byProgram;
  if (a.year !== b.year) return a.year - b.year;
  return (a.meritListNumber ?? Infinity) - (b.meritListNumber ?? Infinity);
});

// `meritListThresholds` is a second copy of the same closing figures. Nothing
// reads it today, but leaving a stale copy behind is how the lists drifted out
// of sync in the first place, so it is regenerated from the same rows.
if (data.meritListThresholds) {
  const thresholds = {};
  for (const entry of data.meritHistory) {
    if (!rebuiltYears.has(entry.year)) continue;
    thresholds[entry.programId] ??= {};
    (thresholds[entry.programId][entry.year] ??= []).push({
      meritListNumber: entry.meritListNumber,
      closingAggregate: entry.closingAggregate,
      closingPosition: entry.closingMeritPosition,
    });
  }
  data.meritListThresholds = thresholds;
}

// Same two-space pretty-print the file already uses, so a data change reads as
// a line diff rather than a reformat.
fs.writeFileSync(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);

console.log(`rebuilt ${rebuilt.length} program-cycles from the official CSVs`);
if (added.length) console.log(`added ${added.length} program-cycles the JSON was missing:\n  ${added.join('\n  ')}`);
if (skipped.length) console.log(`left ${skipped.length} program-cycles untouched:\n  ${skipped.join('\n  ')}`);
console.log(`meritHistory: ${data.meritHistory.length} rows`);
