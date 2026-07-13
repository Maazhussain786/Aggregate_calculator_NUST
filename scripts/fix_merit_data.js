// Fix all 2025 final merit data in sampleMeritData.json
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'sampleMeritData.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// User's correct 2025 final data: [programId, correctMP, correctAggregate]
const corrections = [
  ['smme-me',    2355,  68.80],
  ['ceme-me',    5422,  61.60],
  ['cae-ae',     2470,  68.47],
  ['seecs-ee',   1821,  70.63],
  ['ceme-ee',    5179,  62.08],
  ['seecs-se',   846,   75.18],
  ['pnec-cs',    4419,  63.88],
  ['seecs-cs',   853,   75.03],
  ['nbc-civil',  15826, 45.18],
  ['nbc-cs',     14263, 50.45],
  ['cae-av',     2922,  67.20],
  ['igis-geo',   6699,  59.36],
  ['iese-env',   6915,  59.01],
  ['mcs-is',     3972,  64.60],
  ['smme-ae',    2526,  68.32],
  ['seecs-ds',   909,   74.70],
  ['asab-bsfs',  866,   62.97],
  ['seecs-ai',   642,   76.58],
  ['nbc-ai',     14410, 50.30],
  ['iese-envsc', 789,   65.91],
  ['asab-bsbio', 253,   73.40],
  ['asab-bsag',  1646,  56.28],
  ['nbs-bba',    773,   69.65],
  ['nbs-bsaf',   759,   69.74],
  ['nbs-bsth',   2809,  59.39],
  ['s3h-bseco',  1248,  66.63],
  ['s3h-bsmc',   2692,  59.87],
  ['s3h-bspa',   2531,  60.63],
  ['nls-llb',    264,   65.07],
  ['s3h-bspsy',  2267,  61.82],
  ['sada-bsarch',126,   70.28],
  ['sada-bsid',  231,   66.22],
  ['sines-bsbi', 383,   72.12],
  ['ceme-ce',    3260,  66.33],
  ['ceme-mct',   4144,  64.29],
  ['nice-civil', 5407,  61.63],
  ['mcs-ee',     7488,  58.04],
  ['pnec-ee',    8008,  57.19],
  ['mce-civil',  9604,  54.79],
  ['seecs-ce',   1226,  73.08],
  ['scme-che',   5377,  61.69],
  ['scme-mat',   7501,  58.02],
  ['mcs-se',     3409,  65.96],
  ['pnec-me',    6888,  59.05],
  ['sns-bsmath', 2294,  45.33],
  ['sns-bsphy',  1987,  49.07],
  ['sns-bschem', 2098,  31.74],
  ['s3h-bsla',   3348,  56.94],
];

let updatedCount = 0;
let addedCount = 0;
const changes = [];

for (const [programId, correctMP, correctAgg] of corrections) {
  const entry = data.meritHistory.find(
    e => e.programId === programId && e.year === 2025 && e.meritListNumber === null
  );
  
  if (entry) {
    const oldMP = entry.closingMeritPosition;
    const oldAgg = entry.closingAggregate;
    
    if (oldMP !== correctMP || Math.abs(oldAgg - correctAgg) > 0.001) {
      changes.push(`${programId}: MP ${oldMP}->${correctMP}, Agg ${oldAgg}->${correctAgg}`);
      entry.closingMeritPosition = correctMP;
      entry.closingAggregate = correctAgg;
      updatedCount++;
    }
  } else {
    changes.push(`${programId}: MISSING - no 2025 final entry found`);
  }
}

// Add BE Naval Architecture (PNEC) 2025 entries - currently missing from meritHistory
const naEntries = data.meritHistory.filter(e => e.programId === 'pnec-na' && e.year === 2025);
if (naEntries.length === 0) {
  data.meritHistory.push({
    programId: 'pnec-na',
    year: 2025,
    meritListNumber: 1,
    closingMeritPosition: 5430,
    closingAggregate: 47.70,
    sourceName: 'NUST Official'
  });
  data.meritHistory.push({
    programId: 'pnec-na',
    year: 2025,
    meritListNumber: null,
    closingMeritPosition: 14420,
    closingAggregate: 47.70,
    sourceName: 'NUST Official',
    notes: 'Final List'
  });
  addedCount += 2;
  changes.push('pnec-na: Added 2025 entries (1st list + Final)');
}

// Also update meritListThresholds if any 2025 final entries exist there
if (data.meritListThresholds) {
  for (const [programId, correctMP, correctAgg] of corrections) {
    if (data.meritListThresholds[programId] && data.meritListThresholds[programId]['2025']) {
      const thresholds = data.meritListThresholds[programId]['2025'];
      const finalThreshold = thresholds.find(t => t.meritListNumber === null);
      if (finalThreshold) {
        finalThreshold.closingAggregate = correctAgg;
        finalThreshold.closingPosition = correctMP;
        changes.push(`${programId} (thresholds): Updated final to Agg=${correctAgg}, MP=${correctMP}`);
      }
    }
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log(`\n=== Summary ===`);
console.log(`Updated: ${updatedCount} entries`);
console.log(`Added: ${addedCount} entries`);
console.log(`\nAll changes:`);
changes.forEach(c => console.log(`  - ${c}`));
