// Register-aware ghost text (extended-wizard prototype, rounds 17/36;
// simplified 2026-09-02): once the Event is picked the placeholders
// speak that kind's voice. The who-variable NAME ghosts retired when
// the who menu moved to the Generate button (founder: "I never thought
// it was necessary to have variable placeholders — it was the pronoun
// selector that made them necessary"). The name ghost speaks the category
// exemplar's voice like every other field (founder, 2026-09-02) —
// one static persona per category, no who-variability.
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

export function ghostsFor(category: string | null | undefined): FieldGhosts {
  return category
    ? (GHOSTS_BY_CATEGORY[category] ?? DEFAULT_GHOSTS)
    : DEFAULT_GHOSTS
}
