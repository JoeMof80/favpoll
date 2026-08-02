// Decoy bar widths for blurred, pre-pledge poll results: a plausible-looking
// descending spread that leaks nothing about real standings. One canonical
// list — the list card, poll section, and hero demo must all blur alike.
export const DECOY_WIDTHS = [85, 62, 48, 33, 19]

/**
 * Width for the nth decoy bar — canonical spread first, then a slow
 * decay so long lists still read as a real descending ranking (cycling
 * the five widths saw-toothed; founder-caught, 2026-08-02).
 */
export function decoyWidth(index: number): number {
  if (index < DECOY_WIDTHS.length) return DECOY_WIDTHS[index]
  return Math.max(
    6,
    DECOY_WIDTHS[DECOY_WIDTHS.length - 1] -
      (index - DECOY_WIDTHS.length + 1) * 2
  )
}
