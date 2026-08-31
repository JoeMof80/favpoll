import type { WhoValue } from "@/lib/who"

// Register-aware ghost text (extended-wizard prototype, rounds 17/36):
// once the Event is picked the placeholders speak that kind's voice, and
// the Name ghost follows the who selection — exactly the name Generate
// would write. Guidance without prefilled text the organiser would have
// to notice and delete.
export type FieldGhosts = {
  openingLine: string
  name: string
  context: string
  about: string
  reveal: string
}

export const DEFAULT_GHOSTS: FieldGhosts = {
  openingLine: "Replaces the default opening prefix",
  name: "Name or nickname",
  context: "e.g. turning 40 · Class of 2024",
  about:
    "Two or three sentences — tease the topic and the cause, but don't give too much away.",
  reveal:
    "Guests see this only after they pledge. A quote, a memory, or a message.",
}

const GHOSTS_BY_CATEGORY: Record<string, FieldGhosts> = {
  memorial: {
    openingLine: "e.g. In loving memory of",
    name: "e.g. Mary Whitfield",
    context: "e.g. 1941 – 2026",
    about:
      "e.g. A headmistress for forty-one years with a gift for knowing every pupil's name. There was a season she always loved most.",
    reveal: "e.g. Autumn, always. She said it felt like coming home.",
  },
  celebration: {
    openingLine: "e.g. Celebrating",
    name: "e.g. Poppy Chen",
    context: "e.g. Sweet Sixteen",
    about:
      "e.g. Sixteen on Saturday, and the family can't agree on one thing: the correct ice cream. Settle it with a pledge.",
    reveal: "e.g. Mint choc chip is the best, of course.",
  },
  fundraiser: {
    openingLine: "e.g. Cheering on",
    name: "e.g. Marcus Bell",
    context: "e.g. London Marathon run",
    about:
      "e.g. Running his first marathon for Mind. Whichever hat is leading on the day, he'll wear for all 26.2 miles.",
    reveal:
      "e.g. Thank you for your pledge — if we reach the goal, I'll eat the hat as well.",
  },
}

const NAME_GHOSTS_BY_WHO: Record<string, Record<string, string>> = {
  memorial: {
    she: "Mary Whitfield",
    he: "Edward Whitfield",
    they: "Sam Whitfield",
  },
  celebration: { she: "Poppy Chen", he: "Alfie Chen", they: "Sam Chen" },
  fundraiser: { she: "Amira Bell", he: "Marcus Bell", they: "Sam Bell" },
}

const WHO_NAME_GHOSTS: Partial<Record<WhoValue, string>> = {
  couple: "Priya & Daniel",
  group: "The Thursday Runners",
  cause: "St Mark's Hospice",
}

export function ghostsFor(
  category: string | null | undefined,
  who: WhoValue | ""
): FieldGhosts {
  const base: FieldGhosts = category
    ? (GHOSTS_BY_CATEGORY[category] ?? DEFAULT_GHOSTS)
    : DEFAULT_GHOSTS
  if (!who) return base
  const whoName = WHO_NAME_GHOSTS[who]
  const pronounName =
    NAME_GHOSTS_BY_WHO[category ?? "celebration"]?.[who] ??
    NAME_GHOSTS_BY_WHO.celebration?.[who]
  const name = whoName ?? pronounName
  return name ? { ...base, name: `e.g. ${name}` } : base
}
