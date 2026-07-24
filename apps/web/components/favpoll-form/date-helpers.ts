export const CLOSE_DATE_PRESETS = [
  { label: "Tomorrow", days: 1 },
  { label: "3 days", days: 3 },
  { label: "A week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "A month", days: 30 },
  { label: "6 weeks", days: 42 },
  { label: "3 months", days: 91 },
  { label: "6 months", days: 182 },
]

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}
