export const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

// Fund-bar colours read design tokens so they follow theme changes; CSS
// custom properties resolve inside the inline `style` props these feed.
export const FUND_GREEN = "var(--success)"
export const FUND_AMBER = "var(--warning)"
export const FUND_RED = "var(--destructive)"

export function formatCharityLabel(charityNames: string[]): string {
  if (charityNames.length === 0) return "charity"
  if (charityNames.length === 1) return charityNames[0]
  return charityNames.slice(0, -1).join(", ") + " & " + charityNames.at(-1)!
}

// ─── Optional contribution tiers ─────────────────────────────────────────────
// Chip sets scale with the pledge so the ask stays proportionally modest
// (~10% at the preselected middle) and larger pledges can tip more than £2.
// Always flat amounts — percentage labels read absurd on small pledges —
// and "None" is always first.
export function tipOptionsFor(pledge: number): number[] {
  if (pledge >= 40) return [0, 2, 5, 10]
  if (pledge >= 15) return [0, 1, 2, 3]
  return [0, 0.5, 1, 2]
}

/** The preselected suggestion for a tier — the second-largest option. */
export function defaultTipFor(pledge: number): number {
  return tipOptionsFor(pledge)[2]
}

export function formatTipLabel(value: number): string {
  if (value === 0) return "None"
  if (value < 1) return `${Math.round(value * 100)}p`
  return `£${value}`
}
