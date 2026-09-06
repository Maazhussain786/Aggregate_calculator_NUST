const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'sampleMeritData.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const list6 = {
  // Computing
  'seecs-cs': 618,
  'pnec-cs': 2443,
  'nbc-cs': 4766,
  'seecs-ds': 678,
  'seecs-ai': 410,
  'nbc-ai': 5077,
  'sines-bsbi': 260,
  // Applied Sciences
  'asab-bsbio': 158,
  'asab-bsfs': 759,
  'asab-bsag': 1008,
  'iese-envsc': 402,
  // Natural Sciences
  'sns-bsmath': 1607,
  'sns-bsphy': 1556,
  'sns-bschem': 1397,
  // Engineering
  'smme-me': 1411,
  'ceme-me': 3200,
  'pnec-me': 5582,
  'seecs-ee': 1118,
  'ceme-ee': 2997,
  'mcs-ee': 4676,
  'pnec-ee': 6130,
  'scme-che': 3489,
  'ceme-mct': 2652,
  'nice-civil': 3512,
  'nbc-civil': 8635,
  'mce-civil': 6777,
  'cae-av': 2748,
  'scme-mat': 4194,
  'smme-ae': 1500,
  'cae-ae': 1749,
  'seecs-se': 782,
  'mcs-se': 2840,
  'pnec-na': 7541,
  'igis-geo': 3844,
  'seecs-ce': 822,
  'ceme-ce': 2160,
  'iese-env': 4167,
  'mcs-is': 3169,
  'uspcase-energy': 3893,
  // Management / Social Sciences
  'nbs-bba': 635,
  'nbs-bsaf': 458,
  'nbs-bsth': 2154,
  's3h-bseco': 777,
  's3h-bspa': 1688,
  's3h-bsmc': 1992,
  's3h-bspsy': 1565,
  'nls-llb': 207,
  's3h-bsla': 2199,
  // Architecture & Industrial Design
  'sada-bsarch': 105,
  'sada-bsid': 151,
};

// Validate program IDs
const validIds = new Set(data.programs.map(p => p.id));
for (const pid of Object.keys(list6)) {
  if (!validIds.has(pid)) { console.error('Unknown programId:', pid); process.exit(1); }
}

// Check no duplicates
const existing = new Set(
  data.meritHistory.filter(e => e.year === 2026 && e.meritListNumber === 6).map(e => e.programId)
);
if (existing.size > 0) { console.error('List 6 entries already exist!'); process.exit(1); }

// Add entries
for (const [pid, position] of Object.entries(list6)) {
  data.meritHistory.push({
    programId: pid,
    year: 2026,
    meritListNumber: 6,
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
console.log(`Added ${Object.keys(list6).length} entries for list 6`);
console.log(`2026 now has ${e2026.length} entries across lists: [${lists.join(', ')}]`);
for (const ln of lists) console.log(`  List ${ln}: ${e2026.filter(e => e.meritListNumber === ln).length} programs`);
