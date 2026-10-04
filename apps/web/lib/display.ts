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
 * Hero name size — ONE standard size (founder call, 2026-07-29: the compact
 * size reads fine — better, even — in all cases, and it rarely wraps, so the
 * sticky hero's height stays predictable), with ONE step down for names that
 * would wrap on a phone (founder, 2026-08-31: "St Mark's Hospice" broke onto
 * two lines beside its avatar — "it would be better to reduce the size").
 *
 * Measured on the real cause page at 390px: the name column beside the
 * avatar is 222px, and 30px medium Plus Jakarta runs ~13.5px a character, so
 * sixteen characters is the last that fits on one line; at 24px it is
 * twenty. Below the threshold nothing changes. Long names beyond it still
 * wrap rather than truncate — the hero is the one canonical surface where
 * the full name must appear; the h1's two-line clamp guards absurd input.
 *
 * Shared here so the three heroes (BaseFavpollHero, CauseHero,
 * EditableHero) and the demo card cannot drift apart.
 */
export const HERO_NAME_STEP_DOWN_AT = 16

/** The phone half of the ramp on its own — the demo card's phone frame. */
export function heroNameMobileSizeClass(name: string): string {
  return name.trim().length >= HERO_NAME_STEP_DOWN_AT ? "text-2xl" : "text-3xl"
}

export function heroNameSizeClass(name: string, compact = false): string {
  // The redesign (founder, 2026-09-05): a long name may BREAK onto two
  // lines at a slightly reduced size — so the step-down now reaches sm+
  // too, instead of every name forcing text-4xl into the clamp.
  //
  // COMPACT (founder, 2026-09-29: "reduce the size along with the column
  // width"): with the guest book expanded the rail takes half the sheet
  // and the name column beside the avatar is ~260px — the phone's
  // regime (222px), so the phone ramp stands on its own, with no sm+
  // step up.
  if (compact) return heroNameMobileSizeClass(name)
  return name.trim().length >= HERO_NAME_STEP_DOWN_AT
    ? `${heroNameMobileSizeClass(name)} sm:text-3xl`
    : `${heroNameMobileSizeClass(name)} sm:text-4xl`
}

// THE PROJECTOR TYPE RAMP IS GONE (founder, 2026-10-04: "i don't know why
// you scaled up the standings from the favpoll page design" — and, on
// uniform scaling, "I tested zooming in the browser to 110% and 125% and it
// works nicely if an organiser needs to uniform scale. I want it that way").
//
// It was tuned 2026-08-06 for DisplayScreen, where the money was the hero,
// and I carried it onto the composed room in #984: the room's ranking
// labels read 24px against the page's 14px, and #1003 took the topic
// heading to 32.64px. That is a hand-tweak of a copy of the page, which is
// the opposite of the direction the room was rebuilt under — the display IS
// the favpoll page, presented in a room.
//
// So the room renders the page's own sizes, and BROWSER ZOOM is the lever
// when a room needs it bigger: it scales every relationship at once, which
// is what the per-element ramp could not do without breaking the geometry
// settled in #984 (the goal card's 29px box against the countdown's).
// ROOM_TYPE_RAMP, roomTypeScale, roomTypeScaleAtWidth and RoomTypeScale
// were deleted here; git history has the numbers if a ramp is ever wanted.

/**
 * The display as a screen in a room: 1920 x 1080, the size a projector
 * actually is.
 *
 * IT WAS 1600 x 900, the narrowest width at which the display has gutters at
 * all — the card is max-w-6xl (72rem, 1152px), so the gutter there is
 * (1600-1152)/2 = 224 against a 200px code, twelve pixels a side. Faithful,
 * and it read as a code crammed into a margin (founder, 2026-08-27: "QR codes
 * slightly too big"). At 1920 the gutter is 384 and the same 200px code has
 * 92px either side, which is the room it has on a real screen.
 *
 * SHRINKING THE CODE WOULD HAVE BEEN THE WRONG FIX: 200px is the product's
 * own decision, sized to scan from across a room, and an artefact whose whole
 * charter is to be the real thing does not get to quietly re-take it.
 *
 * AND IT COSTS NOTHING IN LEGIBILITY, which is why this is free rather than a
 * trade. The type ramp is linear in width and the still's scale is inversely
 * linear in it, so on-screen type is constant across the change: the figure
 * goes 41.6px at 1600 and 49.9px at 1920, rendered at 0.351 and 0.294, which
 * is 14.6px either way. Only the gutters grow.
 *
 * Lives here rather than with the still so DisplayScreen can resolve the type
 * ramp against it without importing its own caller.
 */
export const DISPLAY_ROOM = { w: 1920, h: 1080 } as const

/**
 * How a protagonist is referred to in the possessive — "Belinda's favourite",
 * "Alex & Jordan's favourite".
 *
 * A FIRST NAME IS NOT ALWAYS THE ANSWER. Six places independently did
 * `name.split(/[\s&]+/)[0]`, which is right for one person and wrong for two:
 * "Alex & Jordan" came out as "Alex", so a couple's own place card told
 * guests that ALEX had a favourite and said nothing about Jordan. The same
 * class of bug as the avatar initials that read "S&" — a couple is a
 * first-class case, since Wedding and Anniversary are both in the
 * celebrating_many register.
 *
 * So: a joined name is kept whole, and only a single person is shortened.
 * Deliberately not "their", which reads as a third party rather than as the
 * people the favpoll is for.
 */
export function protagonistShortName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ""
  const joined = /\s&\s|\sand\s/i.test(trimmed)
  return joined ? trimmed : trimmed.split(/\s+/)[0]
}
