import { formatCurrency } from "./i18n"
import { registerForOccasionType } from "./registers"

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

export function formatFavpollDate(
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
  cause: "Honouring",
  neutral: "Honouring",
}

export function getFavpollHeadline(params: {
  register?: string
  occasionType: string | null
  name: string
  dateLabel?: string | null
  openingLine?: string | null
  subject?: "someone" | "cause"
}): { prefix: string; name: string; suffix: string } {
  const { occasionType, name: personName, dateLabel, openingLine } = params
  const subject = params.subject ?? "someone"
  // Subject-first, like deriveRegister (2026-07-13 remodel): a faceless cause
  // is the cause register regardless of occasion_type — otherwise a cause
  // favpoll with no opening line fell back to the "Honouring" prefix, the
  // exact honour-overclaim the triad decision forbids (caught by the cause
  // e2e's first live run).
  const register =
    params.register ??
    (subject === "cause" ? "cause" : registerForOccasionType(occasionType))

  const registerPrefix =
    subject === "cause" && register === "cause"
      ? "In support of"
      : (REGISTER_PREFIXES[register] ?? "Honouring")

  const prefix =
    openingLine ||
    (occasionType && OCCASION_TYPE_PREFIXES[occasionType]) ||
    registerPrefix

  return { prefix, name: personName, suffix: dateLabel ?? "" }
}

/**
 * Hero name size — ONE standard size for every name (founder call,
 * 2026-07-29: the compact size reads fine — better, even — in all cases,
 * and it rarely wraps, so the sticky hero's height stays predictable).
 * Shared here so the three heroes (BaseFavpollHero, CauseHero,
 * EditableHero) cannot drift apart. Long names still wrap rather than
 * truncate — the hero is the one canonical surface where the full name
 * must appear; the h1's two-line clamp guards absurd input.
 */
export const heroNameSizeClass = "text-3xl sm:text-4xl"

/**
 * The projector type ramp (founder, 2026-08-06).
 *
 * The display is the one surface meant to be read from the far side of a
 * room, and every size on it was fixed: an 18px ranking label on a 1920
 * projector is roughly 13mm of text on a 65" screen, which from ten metres
 * is around 4-5 arcminutes of visual angle where comfortable reading wants
 * closer to 10. Widening the content column would not have moved that by a
 * millimetre — it spreads the same small type further apart. SIZE is the
 * lever, not width, which is why the gutters were left alone: from 1600px
 * they are the QR rail, and that is real work.
 *
 * Delivered as custom properties rather than props because the ranking bars
 * and the poll section are shared components — they read these with the
 * CURRENT size as the fallback, so every other surface is untouched and no
 * flag has to be threaded down.
 *
 * vw, not container units: a projector IS the viewport. That also means the
 * landing page's framed still must NOT opt in — it renders at a fixed 900px
 * inside whatever viewport the visitor has, so vw-scaled type would burst
 * its layout on a large monitor. DisplayScreen applies these only when
 * `live`.
 *
 * Each is clamp(today's size, vw-relative, ceiling): unchanged at 1440 and
 * below, growing to the cap at about 2880.
 */
export const roomTypeScale = {
  /** Money figure / protagonist name — today's sm:text-4xl at the floor. */
  "--display-figure": "clamp(2.25rem, 2.6vw, 4.5rem)",
  /** "FAVOURITE HOT DRINK" — today's md:text-2xl at the floor. */
  "--display-topic": "clamp(1.5rem, 1.7vw, 3rem)",
  /** Ranking labels and amounts — today's text-lg at the floor. */
  "--display-rank": "clamp(1.125rem, 1.25vw, 2.25rem)",
  /** Bar thickness, so the bars keep their weight against the labels. */
  "--display-bar": "clamp(0.5rem, 0.55vw, 1rem)",
} as const
