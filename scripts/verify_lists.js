const d = require('../src/data/sampleMeritData.json');
const e2026 = d.meritHistory.filter(e => e.year === 2026);

console.log('=== VERIFICATION ===');
console.log('Total 2026 entries:', e2026.length);

const lists = [...new Set(e2026.map(e => e.meritListNumber))].sort();
console.log('Lists:', lists);

for (const ln of lists) {
  const entries = e2026.filter(e => e.meritListNumber === ln);
  console.log(`\nList ${ln} (${entries.length} programs):`);
  entries.slice(0, 3).forEach(e => console.log(`  ${e.programId}: position ${e.closingMeritPosition}`));
  console.log('  ...');
}

console.log('\n=== Spot checks ===');
const checks = [
  ['seecs-cs', 4, 592],
  ['seecs-cs', 5, 618],
  ['sada-bsarch', 4, 105],
  ['sada-bsarch', 5, 105],
  ['nbc-civil', 4, 8042],
  ['nbc-civil', 5, 8234],
  ['nls-llb', 4, 196],
  ['nls-llb', 5, 202],
  ['mce-civil', 4, 6042],
  ['mce-civil', 5, 6583],
];

let allOk = true;
for (const [pid, ln, expected] of checks) {
  const entry = e2026.find(e => e.programId === pid && e.meritListNumber === ln);
  const actual = entry?.closingMeritPosition;
  const ok = actual === expected;
  if (!ok) allOk = false;
  console.log(`  ${pid} List ${ln}: ${actual} (expected ${expected}) ${ok ? 'OK' : 'FAIL'}`);
}

console.log(allOk ? '\n ALL CHECKS PASSED' : '\n SOME CHECKS FAILED');
