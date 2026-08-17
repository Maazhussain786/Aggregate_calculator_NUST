/**
 * Kept apart from `meritData` so client components can label a merit list
 * without pulling the whole dataset into the browser bundle.
 */

/** "1st", "2nd", "3rd", … */
export function ordinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

/**
 * Names a run of merit lists in prose: "1st list", "1st and 2nd lists",
 * "1st, 2nd and 3rd lists". Empty gives "", so a caller can interpolate it
 * behind a length check without building the sentence twice.
 */
export function listSeries(numbers: number[]): string {
  const names = numbers.map(ordinal);
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} list`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} lists`;
}
