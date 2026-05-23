
export const OCCASION_LIST = [
  { value: "memorial", label: "Memorial" },
  { value: "tribute", label: "Tribute" },
  { value: "birthday", label: "Birthday" },
  { value: "retirement", label: "Retirement" },
  { value: "wedding", label: "Wedding" },
  { value: "engagement", label: "Engagement" },
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
  engagement: "Congratulations to",
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
  engagement: "Who got engaged?",
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
  engagement: "How they got engaged",
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
  engagement: "Engaged 14th February 2025",
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
  engagement: 14,
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
  about: string
  reveal: string
}

export const OCCASION_PLACEHOLDERS: Record<string, OccasionPlaceholders> = {
  memorial: {
    name: "Belinda Johnson",
    about: "A beloved mother, teacher, and friend who spent her life bringing people together and always had time for a long conversation over tea…",
    reveal:
      "e.g. Belinda's was purple. She wore it to every important occasion.",
  },
  tribute: {
    name: "David Osei",
    about: "A mentor to dozens, a friend to hundreds, and the person who always knew exactly what to say…",
    reveal:
      "e.g. David's was Waterloo Sunset. He said it made him feel London was beautiful.",
  },
  birthday: {
    name: "Sarah Mitchell",
    about: "Sarah is turning 40 and has never met a cheese she didn't like. She spends her weekends hiking, hosting elaborate dinner parties, and planning trips she may or may not actually take…",
    reveal:
      "e.g. Sarah's is the Bourbon. She once ate four packets in one sitting.",
  },
  retirement: {
    name: "David Clarke",
    about: "After 35 years building the engineering team from four people to four hundred, David is finally putting down his laptop, ignoring his email, and picking up his golf clubs for good…",
    reveal:
      "e.g. David's was the Dordogne. He kept a photo of it on his desk for thirty years.",
  },
  wedding: {
    name: "Emma & James",
    about: "Emma and James met at a rainy music festival in 2019 and haven't been apart since. They share a love of travel, strong coffee, and an ongoing argument about the best pizza in Naples…",
    reveal:
      "e.g. Theirs was Italian. They've been arguing about the best pizza in Naples since 2019.",
  },
  engagement: {
    name: "Sophie & Callum",
    about: "Callum proposed at the top of Arthur's Seat on New Year's Day. Sophie said yes before he'd finished the question…",
    reveal:
      "e.g. Theirs was Perfect. It played when they weren't trying to be romantic, and that was the point.",
  },
  anniversary: {
    name: "Mum & Dad",
    about: "Forty years of adventures, arguments, laughter, and love — still each other's favourite person to share a pot of tea with…",
    reveal:
      "e.g. Theirs was a pot of tea and a good biscuit. Same time every morning for forty years.",
  },
  leaving: {
    name: "Priya Sharma",
    about: "Priya's heading off to start her own studio after six brilliant years. She leaves a trail of good work, better jokes, and a coffee machine that finally gets used properly…",
    reveal: "e.g. Priya's was dal. She said it made any flat feel like home.",
  },
  graduation: {
    name: "Tom Ellis",
    about: "Tom just finished four years of architecture at Manchester — somehow managing to graduate with a first, a collection of impressive scale models, and zero sleep debt…",
    reveal:
      "e.g. Tom's was Spirited Away. He said it reminded him why things worth doing take time.",
  },
  christening: {
    name: "Lily Rose",
    about: "Born on a Tuesday in March, already an expert at looking unimpressed. We couldn't be happier to have her…",
    reveal: "e.g. We'll tell her one day. For now, we're just glad she's here.",
  },
  achievement: {
    name: "Marcus Webb",
    about: "Marcus just ran his first marathon — raising over £4,000 for the RNLI along the way. He trained for eight months, mostly in the dark, mostly in the rain…",
    reveal:
      "e.g. Marcus's was Mr. Brightside. Apparently it got him through mile 18.",
  },
  recovery: {
    name: "Claire Hennessy",
    about: "Claire completed her treatment last month and is celebrating one year of recovery. She's been braver than most of us will ever need to be…",
    reveal:
      "e.g. Claire's was Vienna by Ultravox. She played it on repeat for months.",
  },
  award: {
    name: "Dr. Amelia Grant",
    about: "Amelia has just been named Teacher of the Year — recognised for turning her classroom into one of the most inspiring places in the county…",
    reveal:
      "e.g. Dr. Grant's was The Lion, the Witch and the Wardrobe. She said it taught her how to teach.",
  },
  promotion: {
    name: "Kwame Asante",
    about: "After three years of going above and beyond, Kwame has been promoted to Head of Product. Nobody deserves it more…",
    reveal: "e.g. Kwame's was a flat white. Two sugars. Never wavered once.",
  },
  celebration: {
    name: "The guest of honour",
    about: "Tell their story — who they are, what makes them worth celebrating, why people are gathering…",
    reveal:
      "e.g. Theirs was something they never tired of. Ask them about it some time.",
  },
  other: {
    name: "The guest of honour",
    about: "Tell their story — who they are, what makes them worth celebrating, why people are gathering…",
    reveal:
      "e.g. Theirs was something they never tired of. Ask them about it some time.",
  },
}

/**
 * Per-topic-title placeholder overrides for the reveal field.
 * Used in PollEditor as a fallback when no topic JSONB placeholder exists.
 * {name} is substituted with the first name of the occasion persona at render time.
 */
export const TOPIC_REVEAL_PLACEHOLDERS: Record<string, { reveal: string }> = {
  Colour: {
    reveal:
      "e.g. Belinda's was purple. She wore it to every important occasion.",
  },
  Season: {
    reveal:
      "e.g. {name}'s was autumn. She said it always felt like coming home.",
  },
  Film: {
    reveal: "e.g. {name}'s was It's a Wonderful Life. She cried every time.",
  },
  Song: {
    reveal:
      "e.g. {name}'s was Waterloo Sunset. She said it made London feel beautiful.",
  },
  Flower: {
    reveal:
      "e.g. {name}'s was lavender. She grew it in every garden she ever had.",
  },
  Animal: {
    reveal:
      "e.g. {name}'s was the robin. She said they were the bravest small thing.",
  },
  "Comfort food": {
    reveal:
      "e.g. {name}'s was beans on toast. She said nothing else did the job.",
  },
  Drink: {
    reveal:
      "e.g. {name}'s was tea. Builders brew, milk no sugar, never negotiable.",
  },
  "Way to spend Sunday": {
    reveal:
      "e.g. {name}'s was a long walk followed by a roast. Every week without fail.",
  },
  Biscuit: {
    reveal:
      "e.g. {name}'s was the Bourbon. She once ate four packets in one sitting.",
  },
}

export const DEFAULT_PLACEHOLDERS: OccasionPlaceholders = {
  name: "Name",
  about: "A short bio…",
  reveal: "e.g. Belinda's was purple. She wore it to every important occasion.",
}

export function getAboutPlaceholder(occasion: string): string {
  return OCCASION_PLACEHOLDERS[occasion]?.about ?? DEFAULT_PLACEHOLDERS.about
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
