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
  remembering: ["Memorial", "Celebration of life", "Tribute", "Pet memorial"],
  celebrating_one: [
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

export type OccasionPlaceholders = {
  name: string
  about: string
  reveal: string
}

/** Per occasion_type placeholder copy shown in the form. */
export const OCCASION_TYPE_PLACEHOLDERS: Record<string, OccasionPlaceholders> =
  {
    Memorial: {
      name: "Belinda Johnson",
      about:
        "A beloved mother, teacher, and friend who spent her life bringing people together and always had time for a long conversation over tea…",
      reveal:
        "e.g. Belinda's was purple. She wore it to every important occasion.",
    },
    Tribute: {
      name: "David Osei",
      about:
        "A mentor to dozens, a friend to hundreds, and the person who always knew exactly what to say…",
      reveal:
        "e.g. David's was Waterloo Sunset. He said it made him feel London was beautiful.",
    },
    Birthday: {
      name: "Sarah Mitchell",
      about:
        "Sarah is turning 40 and has never met a cheese she didn't like. She spends her weekends hiking, hosting elaborate dinner parties, and planning trips she may or may not actually take…",
      reveal:
        "e.g. Sarah's is the Bourbon. She once ate four packets in one sitting.",
    },
    Retirement: {
      name: "David Clarke",
      about:
        "After 35 years building the engineering team from four people to four hundred, David is finally putting down his laptop, ignoring his email, and picking up his golf clubs for good…",
      reveal:
        "e.g. David's was the Dordogne. He kept a photo of it on his desk for thirty years.",
    },
    Wedding: {
      name: "Emma & James",
      about:
        "Emma and James met at a rainy music festival in 2019 and haven't been apart since. They share a love of travel, strong coffee, and an ongoing argument about the best pizza in Naples…",
      reveal:
        "e.g. Theirs was Italian. They've been arguing about the best pizza in Naples since 2019.",
    },
    Engagement: {
      name: "Sophie & Callum",
      about:
        "Callum proposed at the top of Arthur's Seat on New Year's Day. Sophie said yes before he'd finished the question…",
      reveal:
        "e.g. Theirs was Perfect. It played when they weren't trying to be romantic, and that was the point.",
    },
    Anniversary: {
      name: "Mum & Dad",
      about:
        "Forty years of adventures, arguments, laughter, and love — still each other's favourite person to share a pot of tea with…",
      reveal:
        "e.g. Theirs was a pot of tea and a good biscuit. Same time every morning for forty years.",
    },
    "Leaving do": {
      name: "Priya Sharma",
      about:
        "Priya's heading off to start her own studio after six brilliant years. She leaves a trail of good work, better jokes, and a coffee machine that finally gets used properly…",
      reveal: "e.g. Priya's was dal. She said it made any flat feel like home.",
    },
    Graduation: {
      name: "Tom Ellis",
      about:
        "Tom just finished four years of architecture at Manchester — somehow managing to graduate with a first, a collection of impressive scale models, and zero sleep debt…",
      reveal:
        "e.g. Tom's was Spirited Away. He said it reminded him why things worth doing take time.",
    },
    Christening: {
      name: "Lily Rose",
      about:
        "Born on a Tuesday in March, already an expert at looking unimpressed. We couldn't be happier to have her…",
      reveal:
        "e.g. We'll tell her one day. For now, we're just glad she's here.",
    },
    Achievement: {
      name: "Marcus Webb",
      about:
        "Marcus just ran his first marathon — raising over £4,000 for the RNLI along the way. He trained for eight months, mostly in the dark, mostly in the rain…",
      reveal:
        "e.g. Marcus's was Mr. Brightside. Apparently it got him through mile 18.",
    },
    Recovery: {
      name: "Claire Hennessy",
      about:
        "Claire completed her treatment last month and is celebrating one year of recovery. She's been braver than most of us will ever need to be…",
      reveal:
        "e.g. Claire's was Vienna by Ultravox. She played it on repeat for months.",
    },
    Award: {
      name: "Dr. Amelia Grant",
      about:
        "Amelia has just been named Teacher of the Year — recognised for turning her classroom into one of the most inspiring places in the county…",
      reveal:
        "e.g. Dr. Grant's was The Lion, the Witch and the Wardrobe. She said it taught her how to teach.",
    },
    Promotion: {
      name: "Kwame Asante",
      about:
        "After three years of going above and beyond, Kwame has been promoted to Head of Product. Nobody deserves it more…",
      reveal: "e.g. Kwame's was a flat white. Two sugars. Never wavered once.",
    },
  }

/** Register-level fallback placeholders when no occasion_type is set. */
export const REGISTER_PLACEHOLDERS: Record<Register, OccasionPlaceholders> = {
  remembering: {
    name: "Belinda Johnson",
    about:
      "A beloved mother, teacher, and friend who spent her life bringing people together…",
    reveal:
      "e.g. Belinda's was purple. She wore it to every important occasion.",
  },
  celebrating_one: {
    name: "The guest of honour",
    about:
      "Tell their story — who they are, what makes them worth celebrating…",
    reveal:
      "e.g. Theirs was something they never tired of. Ask them about it some time.",
  },
  celebrating_many: {
    name: "Emma & James",
    about:
      "Tell their story — what brings them together, what makes them special…",
    reveal:
      "e.g. Theirs was something they never tired of. Ask them about it some time.",
  },
  cause: {
    name: "The guest of honour",
    about:
      "Tell the story — who is involved, what is the cause, why it matters…",
    reveal:
      "e.g. Theirs was something worth sharing. Ask them about it some time.",
  },
  neutral: {
    name: "The guest of honour",
    about:
      "Tell their story — who they are, what makes them worth celebrating, why people are gathering…",
    reveal:
      "e.g. Theirs was something they never tired of. Ask them about it some time.",
  },
}

export const DEFAULT_PLACEHOLDERS: OccasionPlaceholders = {
  name: "Name",
  about: "A short bio…",
  reveal: "e.g. Belinda's was purple. She wore it to every important occasion.",
}

/** Resolve the best placeholder set given register + optional occasionType. */
export function resolvePlaceholders(
  register: string | null | undefined,
  occasionType: string | null | undefined
): OccasionPlaceholders {
  if (occasionType && OCCASION_TYPE_PLACEHOLDERS[occasionType]) {
    return OCCASION_TYPE_PLACEHOLDERS[occasionType]
  }
  if (register && REGISTER_PLACEHOLDERS[register as Register]) {
    return REGISTER_PLACEHOLDERS[register as Register]
  }
  return DEFAULT_PLACEHOLDERS
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
