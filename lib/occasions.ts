export const OCCASION_LIST = [
  { value: "memorial", label: "Memorial" },
  { value: "tribute", label: "Tribute" },
  { value: "birthday", label: "Birthday" },
  { value: "retirement", label: "Retirement" },
  { value: "wedding", label: "Wedding" },
  { value: "anniversary", label: "Anniversary" },
  { value: "leaving", label: "Leaving do" },
  { value: "graduation", label: "Graduation" },
  { value: "christening", label: "Christening" },
  { value: "achievement", label: "Achievement" },
  { value: "recovery", label: "Recovery" },
  { value: "award", label: "Award" },
  { value: "promotion", label: "Promotion" },
  { value: "celebration", label: "Celebration" },
  { value: "other", label: "Other" },
] as const

// Keep OCCASIONS alias — used by EventCanvas edit mode
export const OCCASIONS = OCCASION_LIST

export const OCCASION_LABELS: Record<string, string> = {
  memorial: "In memory of",
  tribute: "A tribute to",
  birthday: "Happy birthday to",
  retirement: "Celebrating the retirement of",
  wedding: "Congratulations to",
  anniversary: "Happy anniversary to",
  leaving: "Farewell to",
  graduation: "Congratulations to",
  christening: "Welcome",
  achievement: "Celebrating",
  recovery: "Cheering on",
  award: "Congratulations to",
  promotion: "Congratulations to",
  celebration: "Celebrating",
  other: "A tribute to",
}

export const NAME_LABELS: Record<string, string> = {
  memorial: "Who are we remembering?",
  tribute: "Who are we honouring?",
  birthday: "Who's celebrating?",
  retirement: "Who's retiring?",
  wedding: "Who's getting married?",
  anniversary: "Who's celebrating their anniversary?",
  leaving: "Who's leaving?",
  graduation: "Who's graduating?",
  christening: "Who's being christened?",
  achievement: "Who's the star?",
  recovery: "Who are we cheering on?",
  award: "Who won the award?",
  promotion: "Who got promoted?",
  celebration: "Who are we celebrating?",
  other: "Who is this for?",
}

export const DESCRIPTION_LABELS: Record<string, string> = {
  memorial: "Tell their story",
  tribute: "Tell their story",
  birthday: "A bit about them",
  retirement: "Their career in a nutshell",
  wedding: "How they met",
  anniversary: "Their story so far",
  leaving: "What they're off to do",
  graduation: "Their journey",
  christening: "About the family",
  achievement: "What they achieved",
  recovery: "Their journey",
  award: "Why they deserve it",
  promotion: "Their career so far",
  celebration: "What we're celebrating",
  other: "A bit of context",
}

export const DATE_LABEL_PLACEHOLDERS: Record<string, string> = {
  memorial: "1940 - 2024",
  tribute: "Born 1962",
  birthday: "Born 15th March 1990 · Turning 35",
  retirement: "Joined 1989 · Retiring 2024",
  wedding: "Married 20th June 2025",
  anniversary: "Together since 2005 · 20 years",
  leaving: "Joined March 2019",
  graduation: "Class of 2025",
  christening: "Born 3rd April 2025",
  achievement: "2nd November 2025",
  recovery: "One year on 15th June",
  award: "Awarded January 2025",
  promotion: "Starting 1st February 2025",
  celebration: "Since 2010",
  other: "2020-2025",
}

export const CLOSING_DEFAULTS: Record<string, number> = {
  memorial: 30,
  tribute: 21,
  birthday: 14,
  retirement: 21,
  wedding: 14,
  anniversary: 21,
  leaving: 14,
  graduation: 14,
  christening: 14,
  achievement: 14,
  recovery: 14,
  award: 14,
  promotion: 14,
  celebration: 14,
  other: 14,
}

export type OccasionPlaceholders = {
  name: string
  bio: string
  framing: string
  quote: string
}

export const OCCASION_PLACEHOLDERS: Record<string, OccasionPlaceholders> = {
  memorial: {
    name: "Belinda Johnson",
    bio: "A beloved mother, teacher, and friend who spent her life bringing people together and always had time for a long conversation over tea…",
    framing: "Belinda's favourite was always the Lake District — what's yours?",
    quote:
      "She always said the best journeys are the ones you take with people you love…",
  },
  tribute: {
    name: "David Osei",
    bio: "A mentor to dozens, a friend to hundreds, and the person who always knew exactly what to say…",
    framing:
      "David introduced so many people to jazz — what's your favourite genre?",
    quote: "He always believed that good music makes every moment better…",
  },
  birthday: {
    name: "Sarah Mitchell",
    bio: "Sarah is turning 40 and has never met a cheese she didn't like. She spends her weekends hiking, hosting elaborate dinner parties, and planning trips she may or may not actually take…",
    framing: "Sarah's been dreaming about Japan — where would you send her?",
    quote: "She always says life's too short to order the same thing twice…",
  },
  retirement: {
    name: "David Clarke",
    bio: "After 35 years building the engineering team from four people to four hundred, David is finally putting down his laptop, ignoring his email, and picking up his golf clubs for good…",
    framing:
      "David always talked about exploring South America — where should he go first?",
    quote:
      "He's been saying 'one more year' for five years running — we're holding him to it…",
  },
  wedding: {
    name: "Emma & James",
    bio: "Emma and James met at a rainy music festival in 2019 and haven't been apart since. They share a love of travel, strong coffee, and an ongoing argument about the best pizza in Naples…",
    framing:
      "They're both obsessed with food — what cuisine should they discover on honeymoon?",
    quote:
      "James proposed at the exact spot where they had their first dance, three years to the day…",
  },
  anniversary: {
    name: "Mum & Dad",
    bio: "Forty years of adventures, arguments, laughter, and love — still each other's favourite person to share a pot of tea with…",
    framing:
      "They've been to so many places together — where should they go next?",
    quote:
      "The secret? Never go to bed angry — and always have good biscuits in the tin.",
  },
  leaving: {
    name: "Priya Sharma",
    bio: "Priya's heading off to start her own studio after six brilliant years. She leaves a trail of good work, better jokes, and a coffee machine that finally gets used properly…",
    framing:
      "Priya always said she'd travel more once she left — where should she go first?",
    quote: "She leaves a hole in the team that will be very hard to fill…",
  },
  graduation: {
    name: "Tom Ellis",
    bio: "Tom just finished four years of architecture at Manchester — somehow managing to graduate with a first, a collection of impressive scale models, and zero sleep debt…",
    framing:
      "Tom's dreamed of living abroad — which city should he explore first?",
    quote:
      "He always said buildings should make people feel something — his certainly do.",
  },
  christening: {
    name: "Lily Rose",
    bio: "Born on a Tuesday in March, already an expert at looking unimpressed. We couldn't be happier to have her…",
    framing:
      "Everyone has a favourite book from childhood — what should Lily's first library include?",
    quote: "Welcome to the world, little one.",
  },
  achievement: {
    name: "Marcus Webb",
    bio: "Marcus just ran his first marathon — raising over £4,000 for the RNLI along the way. He trained for eight months, mostly in the dark, mostly in the rain…",
    framing: "What's the achievement you're most proud of?",
    quote: "The only race worth running is the one you set for yourself…",
  },
  recovery: {
    name: "Claire Hennessy",
    bio: "Claire completed her treatment last month and is celebrating one year of recovery. She's been braver than most of us will ever need to be…",
    framing:
      "Claire says music got her through — what song always lifts your spirits?",
    quote: "One day at a time, and then one more.",
  },
  award: {
    name: "Dr. Amelia Grant",
    bio: "Amelia has just been named Teacher of the Year — recognised for turning her classroom into one of the most inspiring places in the county…",
    framing:
      "Amelia inspired so many people — who was a teacher that changed your life?",
    quote:
      "A great teacher doesn't just teach the subject — they teach you to think.",
  },
  promotion: {
    name: "Kwame Asante",
    bio: "After three years of going above and beyond, Kwame has been promoted to Head of Product. Nobody deserves it more…",
    framing:
      "Kwame's favourite part of the job is shipping things people love — what product has delighted you recently?",
    quote:
      "He always finds a way to make the impossible feel completely achievable.",
  },
  celebration: {
    name: "The Johnson Family",
    bio: "Tell their story — who they are, what makes them worth celebrating, why people are gathering…",
    framing:
      "Add some context — what are you asking, and why does it matter to them?",
    quote:
      "A favourite saying, a running joke, or something that perfectly captures who they are…",
  },
  other: {
    name: "The Johnson Family",
    bio: "Tell their story — who they are, what makes them worth celebrating, why people are gathering…",
    framing:
      "Add some context — what are you asking, and why does it matter to them?",
    quote:
      "A favourite saying, a running joke, or something that perfectly captures who they are…",
  },
}

export const DEFAULT_PLACEHOLDERS: OccasionPlaceholders = {
  name: "Name",
  bio: "A short bio…",
  framing: "Add a personal framing for this question…",
  quote: "A quote or memory (optional)",
}

export function shortTopicLabel(title: string): string {
  const s = title.replace(/^favourite\s+/i, "")
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Suggest a closing date for a poll.
 * - With eventDate: closes CLOSING_DEFAULTS[occasion] days before the event (min: today + days)
 * - Without eventDate: closes CLOSING_DEFAULTS[occasion] days from today
 * Returns "YYYY-MM-DDTHH:MM"
 */
export function suggestClosingDate(
  occasion: string,
  eventDate?: string | null
): string {
  const days = CLOSING_DEFAULTS[occasion] ?? 14
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
