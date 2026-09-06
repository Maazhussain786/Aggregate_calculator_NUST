/**
 * Script to add 4th and 5th UG Selection Lists (NET Basis) for 2026
 * to sampleMeritData.json
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'sampleMeritData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// 4th Merit List — Closing Merit Positions
const list4 = {
  // Computing
  'seecs-cs': 592,
  'nbc-cs': 3144,
  'seecs-ai': 410,
  'pnec-cs': 1643,
  'seecs-ds': 614,
  'nbc-ai': 3304,
  'sines-bsbi': 196,
  // Applied Sciences
  'asab-bsbio': 142,
  'asab-bsfs': 717,
  'asab-bsag': 567,
  'iese-envsc': 350,
  // Natural Sciences
  'sns-bsmath': 1301,
  'sns-bsphy': 1250,
  'sns-bschem': 932,
  // Engineering
  'smme-me': 1374,
  'pnec-me': 5344,
  'ceme-ee': 2960,
  'pnec-ee': 5778,
  'ceme-mct': 2616,
  'nbc-civil': 8042,
  'cae-av': 2469,
  'smme-ae': 1401,
  'seecs-se': 677,
  'pnec-na': 6868,
  'seecs-ce': 733,
  'iese-env': 3814,
  'ceme-me': 3200,
  'seecs-ee': 1055,
  'mcs-ee': 4570,
  'scme-che': 3376,
  'nice-civil': 3280,
  'mce-civil': 6042,
  'scme-mat': 3978,
  'cae-ae': 1704,
  'mcs-se': 2751,
  'igis-geo': 3750,
  'ceme-ce': 2160,
  'mcs-is': 2918,
  'uspcase-energy': 3863,
  // Management / Social Sciences
  'nbs-bba': 616,
  'nbs-bsaf': 420,
  'nbs-bsth': 1893,
  's3h-bseco': 736,
  's3h-bspa': 1640,
  's3h-bsmc': 1798,
  's3h-bspsy': 1416,
  'nls-llb': 196,
  's3h-bsla': 1914,
  // Architecture & Industrial Design
  'sada-bsarch': 105,
  'sada-bsid': 152,
};

// 5th Merit List — Closing Merit Positions
const list5 = {
  // Computing
  'seecs-cs': 618,
  'nbc-cs': 4092,
  'seecs-ai': 410,
  'pnec-cs': 2073,
  'seecs-ds': 653,
  'nbc-ai': 4261,
  'sines-bsbi': 232,
  // Applied Sciences
  'asab-bsbio': 155,
  'asab-bsfs': 755,
  'asab-bsag': 802,
  'iese-envsc': 393,
  // Natural Sciences
  'sns-bsmath': 1502,
  'sns-bsphy': 1449,
  'sns-bschem': 1230,
  // Engineering
  'smme-me': 1387,
  'pnec-me': 5408,
  'ceme-ee': 2951,
  'pnec-ee': 5956,
  'ceme-mct': 2648,
  'nbc-civil': 8234,
  'cae-av': 2614,
  'smme-ae': 1449,
  'seecs-se': 748,
  'pnec-na': 7333,
  'seecs-ce': 763,
  'iese-env': 4063,
  'ceme-me': 3200,
  'seecs-ee': 1087,
  'mcs-ee': 4652,
  'scme-che': 3456,
  'nice-civil': 3422,
  'mce-civil': 6583,
  'scme-mat': 4117,
  'cae-ae': 1704,
  'mcs-se': 2804,
  'igis-geo': 3810,
  'ceme-ce': 2160,
  'mcs-is': 3047,
  'uspcase-energy': 3893,
  // Management / Social Sciences
  'nbs-bba': 630,
  'nbs-bsaf': 439,
  'nbs-bsth': 2069,
  's3h-bspa': 1659,
  's3h-bspsy': 1476,
  's3h-bseco': 749,
  's3h-bsmc': 1947,
  'nls-llb': 202,
  's3h-bsla': 2080,
  // Architecture & Industrial Design
  'sada-bsarch': 105,
  'sada-bsid': 151,
};

// Validate: all program IDs in list4 and list5 exist in programs array
const validProgramIds = new Set(data.programs.map(p => p.id));
for (const [listName, listData] of [['list4', list4], ['list5', list5]]) {
  for (const pid of Object.keys(listData)) {
    if (!validProgramIds.has(pid)) {
      console.error(`ERROR: Unknown programId '${pid}' in ${listName}`);
      process.exit(1);
    }
  }
}

// Check no duplicate 2026 list 4 or 5 entries already exist
const existing2026Lists = new Set(
  data.meritHistory
    .filter(e => e.year === 2026)
    .map(e => `${e.programId}-${e.meritListNumber}`)
);
for (const pid of Object.keys(list4)) {
  if (existing2026Lists.has(`${pid}-4`)) {
    console.error(`ERROR: 2026 list 4 entry already exists for '${pid}'`);
    process.exit(1);
  }
}
for (const pid of Object.keys(list5)) {
  if (existing2026Lists.has(`${pid}-5`)) {
    console.error(`ERROR: 2026 list 5 entry already exists for '${pid}'`);
    process.exit(1);
  }
}

// Add meritHistory entries
let addedCount = 0;

for (const [pid, position] of Object.entries(list4)) {
  data.meritHistory.push({
    programId: pid,
    year: 2026,
    meritListNumber: 4,
    closingMeritPosition: position,
    closingAggregate: null,
    sourceName: "NUST Official"
  });
  addedCount++;
}

for (const [pid, position] of Object.entries(list5)) {
  data.meritHistory.push({
    programId: pid,
    year: 2026,
    meritListNumber: 5,
    closingMeritPosition: position,
    closingAggregate: null,
    sourceName: "NUST Official"
  });
  addedCount++;
}

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`✅ Successfully added ${addedCount} entries (${Object.keys(list4).length} for list 4, ${Object.keys(list5).length} for list 5)`);

// Verify
const verify = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const entries2026 = verify.meritHistory.filter(e => e.year === 2026);
const listNums = [...new Set(entries2026.map(e => e.meritListNumber))].sort();
console.log(`📊 2026 now has ${entries2026.length} total entries across lists: [${listNums.join(', ')}]`);
for (const ln of listNums) {
  const count = entries2026.filter(e => e.meritListNumber === ln).length;
  console.log(`   List ${ln}: ${count} programs`);
}
