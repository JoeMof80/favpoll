import { formatCurrency } from "./i18n"

export function charityNames(
  charities: { charity: { name: string } }[]
): string {
  const names = charities.map((c) => c.charity.name)
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names[0]}, ${names[1]} & ${names[2]}`
}

export function formatAmount(amount: number): string {
  return formatCurrency(Math.round(amount) * 100)
}

export function ordinal(n: number, locale: string = "en-GB"): string {
  const rules = new Intl.PluralRules(locale, { type: "ordinal" })
  const suffixes: Record<string, string> = {
    one: "st",
    two: "nd",
    few: "rd",
    other: "th",
  }
  return `${n}${suffixes[rules.select(n)] ?? "th"}`
}

export function formatRelativeDate(
  dateStr: string,
  locale: string = "en-GB"
): string {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.ceil((date.getTime() - now.getTime()) / 86400000)
  if (days < 0) return "soon"
  if (days === 0) return "today"
  if (days === 1) return "tomorrow"
  if (days < 7) return `in ${days} days`
  if (days < 14) return "next week"
  return `${ordinal(date.getDate(), locale)} ${date.toLocaleString(locale, { month: "long" })}`
}

export function formatEventDate(
  date: string | Date,
  locale: string = "en-GB"
): string {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : date
  return `${ordinal(d.getDate(), locale)} ${d.toLocaleString(locale, {
    month: "long",
    year: "numeric",
  })}`
}

export const PREFIXES: Record<string, string> = {
  memorial: "In memory of",
  tribute: "A tribute to",
  birthday: "Happy birthday",
  retirement: "Celebrating the retirement of",
  wedding: "Congratulations to",
  engagement: "Congratulations to",
  anniversary: "Happy anniversary",
  leaving: "Farewell",
  graduation: "Congratulations",
  christening: "Welcome",
  achievement: "Well done",
  recovery: "Cheering on",
  award: "Congratulations to",
  promotion: "Congratulations to",
  celebration: "Celebrating",
  other: "Honouring",
}

export function getEventHeadline(params: {
  occasion: string
  name: string
  dateLabel?: string | null
  occasionLabel?: string | null
}): { prefix: string; name: string; suffix: string } {
  const { occasion, name: personName, dateLabel, occasionLabel } = params

  const prefix = occasionLabel || PREFIXES[occasion] || "Honouring"

  return { prefix, name: personName, suffix: dateLabel ?? "" }
}
