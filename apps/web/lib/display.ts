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

const OCCASION_TYPE_PREFIXES: Record<string, string> = {
  // remembering
  Memorial: "In memory of",
  "Celebration of life": "Celebrating the life of",
  Tribute: "In honour of",
  "Pet memorial": "In memory of",
  // celebrating_one
  Birthday: "Happy birthday",
  "Milestone birthday": "Happy birthday",
  Retirement: "Celebrating the retirement of",
  "Leaving do": "Farewell",
  Graduation: "Congratulations to",
  Christening: "Welcome",
  "Baby shower": "Celebrating",
  "New baby": "Welcome",
  "Bar or bat mitzvah": "Mazel tov to",
  Recovery: "Wishing a speedy recovery to",
  "New job": "Congratulations to",
  Promotion: "Congratulations to",
  Achievement: "Well done",
  Award: "Congratulations to",
  "Exam success": "Congratulations to",
  "New home": "Congratulations to",
  Citizenship: "Congratulations to",
  "Coming out": "Celebrating",
  "Divorce party": "Celebrating",
  "Just because": "Honouring",
  // celebrating_many
  Wedding: "Congratulations to",
  Engagement: "Congratulations to",
  Anniversary: "Happy anniversary",
  "Renewal of vows": "Congratulations to",
  Reunion: "Celebrating",
  "Team celebration": "Celebrating",
  "Family gathering": "Celebrating",
  // cause
  Fundraiser: "In support of",
  "Sponsored event": "In support of",
  "Charity night": "In support of",
  "In memoriam appeal": "In memory of",
}

const REGISTER_PREFIXES: Record<string, string> = {
  remembering: "In memory of",
  celebrating_one: "Celebrating",
  celebrating_many: "Celebrating",
  cause: "In support of",
  neutral: "Honouring",
}

export function getEventHeadline(params: {
  register: string
  occasionType: string | null
  name: string
  dateLabel?: string | null
  openingLine?: string | null
}): { prefix: string; name: string; suffix: string } {
  const {
    register,
    occasionType,
    name: personName,
    dateLabel,
    openingLine,
  } = params

  const prefix =
    openingLine ||
    (occasionType && OCCASION_TYPE_PREFIXES[occasionType]) ||
    REGISTER_PREFIXES[register] ||
    "Honouring"

  return { prefix, name: personName, suffix: dateLabel ?? "" }
}
