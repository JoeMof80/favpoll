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
