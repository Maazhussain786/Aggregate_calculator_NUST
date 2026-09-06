const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'sampleMeritData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const list7 = {
  // Computing
  'seecs-cs': 618,
  'pnec-cs': 2577,
  'nbc-cs': 5477,
  'seecs-ds': 687,
  'seecs-ai': 410,
  'nbc-ai': 5873,
  'sines-bsbi': 260,
  // Applied Sciences
  'asab-bsbio': 159,
  'asab-bsfs': 765,
  'asab-bsag': 1062,
  'iese-envsc': 455,
  // Natural Sciences
  'sns-bsmath': 1687,
  'sns-bsphy': 1655,
  'sns-bschem': 1562,
  // Engineering
  'smme-me': 1417,
  'ceme-me': 3200,
  'pnec-me': 5622,
  'seecs-ee': 1124,
  'ceme-ee': 2997,
  'mcs-ee': 4655,
  'pnec-ee': 6169,
  'scme-che': 3466,
  'ceme-mct': 2675,
  'nice-civil': 3599,
  'nbc-civil': 8950,
  'mce-civil': 6925,
  'cae-av': 2819,
  'scme-mat': 4290,
  'smme-ae': 1538,
  'cae-ae': 1810,
  'seecs-se': 782,
  'mcs-se': 2863,
  'pnec-na': 7733,
  'igis-geo': 3916,
  'seecs-ce': 828,
  'ceme-ce': 2160,
  'iese-env': 4286,
  'mcs-is': 3191,
  'uspcase-energy': 3928,
  // Management / Social Sciences
  'nbs-bba': 643,
  'nbs-bsaf': 459,
  'nbs-bsth': 2161,
  's3h-bseco': 786,
  's3h-bspa': 1719,
  's3h-bsmc': 2008,
  's3h-bspsy': 1581,
  'nls-llb': 210,
  's3h-bsla': 2233,
  // Architecture & Industrial Design
  'sada-bsarch': 105,
  'sada-bsid': 151,
};

const list8 = {
  // Computing
  'seecs-cs': 619,
  'pnec-cs': 2623,
  'nbc-cs': 6335,
  'seecs-ds': 701,
  'seecs-ai': 410,
  'nbc-ai': 6586,
  'sines-bsbi': 260,
  // Applied Sciences
  'asab-bsbio': 159,
  'asab-bsfs': 766,
  'asab-bsag': 1110,
  'iese-envsc': 489,
  // Natural Sciences
  'sns-bsmath': 1727,
  'sns-bsphy': 1728,
  'sns-bschem': 1721,
  // Engineering
  'smme-me': 1423,
  'ceme-me': 3200,
  'pnec-me': 5787,
  'seecs-ee': 1124,
  'ceme-ee': 2997,
  'mcs-ee': 4799,
  'pnec-ee': 6251,
  'scme-che': 3575,
  'ceme-mct': 2675,
  'nice-civil': 3628,
  'nbc-civil': 9581,
  'mce-civil': 6925,
  'cae-av': 2872,
  'scme-mat': 4456,
  'smme-ae': 1543,
  'cae-ae': 1810,
  'seecs-se': 784,
  'mcs-se': 2985,
  'pnec-na': 7824,
  'igis-geo': 4035,
  'seecs-ce': 832,
  'ceme-ce': 2160,
  'iese-env': 4361,
  'mcs-is': 3447,
  'uspcase-energy': 3992,
  // Management / Social Sciences
  'nbs-bba': 651,
  'nbs-bsaf': 459,
  'nbs-bsth': 2189,
  's3h-bseco': 791,
  's3h-bspa': 1719,
  's3h-bsmc': 2011,
  's3h-bspsy': 1590,
  'nls-llb': 211,
  's3h-bsla': 2243,
  // Architecture & Industrial Design
  'sada-bsarch': 105,
  'sada-bsid': 151,
};

// Validate program IDs
const validIds = new Set(data.programs.map(p => p.id));
for (const pid of [...Object.keys(list7), ...Object.keys(list8)]) {
  if (!validIds.has(pid)) { console.error('Unknown programId:', pid); process.exit(1); }
}

// Check no duplicates for list 7
const existing7 = new Set(
  data.meritHistory.filter(e => e.year === 2026 && e.meritListNumber === 7).map(e => e.programId)
);
if (existing7.size > 0) { console.error('List 7 entries already exist!'); process.exit(1); }

// Check no duplicates for list 8
const existing8 = new Set(
  data.meritHistory.filter(e => e.year === 2026 && e.meritListNumber === 8).map(e => e.programId)
);
if (existing8.size > 0) { console.error('List 8 entries already exist!'); process.exit(1); }

// Add list 7 entries
for (const [pid, position] of Object.entries(list7)) {
  data.meritHistory.push({
    programId: pid,
    year: 2026,
    meritListNumber: 7,
    closingMeritPosition: position,
    closingAggregate: null,
    sourceName: "NUST Official"
  });
}

// Add list 8 entries
for (const [pid, position] of Object.entries(list8)) {
  data.meritHistory.push({
    programId: pid,
    year: 2026,
    meritListNumber: 8,
    closingMeritPosition: position,
    closingAggregate: null,
    sourceName: "NUST Official"
  });
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

// Verify
const verify = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const e2026 = verify.meritHistory.filter(e => e.year === 2026);
const lists = [...new Set(e2026.map(e => e.meritListNumber))].sort();
console.log(`Added ${Object.keys(list7).length} entries for list 7`);
console.log(`Added ${Object.keys(list8).length} entries for list 8`);
console.log(`2026 now has ${e2026.length} entries across lists: [${lists.join(', ')}]`);
for (const ln of lists) console.log(`  List ${ln}: ${e2026.filter(e => e.meritListNumber === ln).length} programs`);
