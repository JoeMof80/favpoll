export const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

export const FUND_GREEN = "#1D9E75"
export const FUND_AMBER = "#EF9F27"
export const FUND_RED = "#E24B4A"

export function formatCharityLabel(charityNames: string[]): string {
  if (charityNames.length === 0) return "charity"
  if (charityNames.length === 1) return charityNames[0]
  return charityNames.slice(0, -1).join(", ") + " & " + charityNames.at(-1)!
}
