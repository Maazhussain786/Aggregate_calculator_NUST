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
