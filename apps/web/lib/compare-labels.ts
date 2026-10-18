/**
 * Label order for item lists: alphabetical, with runs of digits compared
 * as numbers. A homemade list named by number ("1 · Friends of St Luke's"
 * … "55 · Queensway Day Services" — the Christmas Tree Festival demo,
 * 2026-10-18) sorted as 1, 10, 11 … 19, 2, 20 under a plain localeCompare;
 * festival trees, raffle tickets and table numbers all need 1, 2, 3.
 * Case- and accent-insensitive, as the picker always was.
 */
export function compareLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
}
