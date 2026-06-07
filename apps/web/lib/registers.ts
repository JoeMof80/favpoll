export type Register =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral"

export type RegisterOption = {
  label: string
  register: Register
  occasionType: string | null
}

/** Six UI chips — shown to the organiser. Two map to celebrating_many. */
export const REGISTER_OPTIONS: RegisterOption[] = [
  {
    label: "In memory of someone",
    register: "remembering",
    occasionType: null,
  },
  {
    label: "Celebrating a person",
    register: "celebrating_one",
    occasionType: null,
  },
  {
    label: "Celebrating a couple",
    register: "celebrating_many",
    occasionType: "Wedding",
  },
  {
    label: "Celebrating a group / team / family",
    register: "celebrating_many",
    occasionType: null,
  },
  { label: "Supporting a cause", register: "cause", occasionType: null },
  { label: "Other / open", register: "neutral", occasionType: null },
]

/** Suggested occasion_type pick-list, filtered by selected register. */
export const OCCASION_TYPES_BY_REGISTER: Record<Register, string[]> = {
  remembering: [
    "Remembrance",
    "Memorial",
    "Celebration of life",
    "Tribute",
    "Pet memorial",
  ],
  celebrating_one: [
    "Celebration",
    "Birthday",
    "Milestone birthday",
    "Retirement",
    "Leaving do",
    "Graduation",
    "Christening",
    "Baby shower",
    "New baby",
    "Bar or bat mitzvah",
    "Recovery",
    "New job",
    "Promotion",
    "Achievement",
    "Award",
    "Exam success",
    "New home",
    "Citizenship",
    "Coming out",
    "Divorce party",
    "Just because",
  ],
  celebrating_many: [
    "Joint celebration",
    "Wedding",
    "Engagement",
    "Anniversary",
    "Renewal of vows",
    "Reunion",
    "Team celebration",
    "Family gathering",
  ],
  cause: [
    "Fundraiser",
    "Sponsored event",
    "Charity night",
    "In memoriam appeal",
  ],
  neutral: [],
}

/**
 * Default occasion_type written when the organiser picks a register but no
 * finer occasion_type. Each value is also a member of OCCASION_TYPES_BY_REGISTER
 * for its register so round-trip derivation is exact.
 */
export const DEFAULT_OCCASION_TYPE: Record<Register, string | null> = {
  remembering: "Remembrance",
  celebrating_one: "Celebration",
  celebrating_many: "Joint celebration",
  cause: "Fundraiser",
  neutral: null,
}

/**
 * Derive the register from an occasion_type string (or null → neutral).
 * Free-text / unknown / absent → "neutral".
 */
export function registerForOccasionType(occasionType: string | null): Register {
  if (!occasionType) return "neutral"
  for (const [reg, types] of Object.entries(OCCASION_TYPES_BY_REGISTER) as [
    Register,
    string[],
  ][]) {
    if (types.includes(occasionType)) return reg
  }
  return "neutral"
}

const REGISTER_CLOSING_DEFAULTS: Record<Register, number> = {
  remembering: 30,
  celebrating_one: 14,
  celebrating_many: 14,
  cause: 21,
  neutral: 14,
}

const OCCASION_TYPE_CLOSING_OVERRIDES: Record<string, number> = {
  Tribute: 21,
  Retirement: 21,
  Anniversary: 21,
}

export const DATE_LABEL_PLACEHOLDERS: Record<string, string> = {
  Memorial: "1940 – 2024",
  Tribute: "Born 1962",
  Birthday: "Born 15th March 1990 · Turning 35",
  Retirement: "Joined 1989 · Retiring 2024",
  Wedding: "Married 20th June 2025",
  Engagement: "Engaged 14th February 2025",
  Anniversary: "Together since 2005 · 20 years",
  "Leaving do": "Joined March 2019",
  Graduation: "Class of 2025",
  Christening: "Born 3rd April 2025",
  Achievement: "2nd November 2025",
  Recovery: "One year on 15th June",
  Award: "Awarded January 2025",
  Promotion: "Starting 1st February 2025",
}

export function shortTopicLabel(title: string): string {
  const s = title.replace(/^favourite\s+/i, "")
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Suggest a closing date for a poll.
 * - With eventDate: closes N days before the event (min: today + N days)
 * - Without eventDate: closes N days from today
 * N is determined by register default, overridden by occasion_type if applicable.
 * Returns "YYYY-MM-DDTHH:MM"
 */
export function suggestClosingDate(
  register: string,
  occasionType?: string | null,
  eventDate?: string | null
): string {
  const typeOverride = occasionType
    ? (OCCASION_TYPE_CLOSING_OVERRIDES[occasionType] ?? null)
    : null
  const days =
    typeOverride ?? REGISTER_CLOSING_DEFAULTS[register as Register] ?? 14

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let target: Date
  if (eventDate) {
    target = new Date(eventDate + "T12:00:00")
    target.setDate(target.getDate() - days)
    if (target <= today) {
      target = new Date(today)
      target.setDate(target.getDate() + days)
    }
  } else {
    target = new Date(today)
    target.setDate(target.getDate() + days)
  }

  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, "0")
  const d = String(target.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}T23:59`
}
