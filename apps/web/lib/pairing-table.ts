import type { CauseFamily, Register } from "@favpoll/types"

/**
 * The pairing table as data — references/favpoll-pairing-table-2026-09-23.md,
 * approved by the founder 2026-09-24. READ THAT NOTE before editing a row.
 *
 * A favpoll is motivated when a guest can see why this topic before
 * pledging. Synergy is three EDGES, not a couplet:
 *
 *   E1  occasion → topic   (§1)   Honour → Love
 *   E2  charity  → topic   (§2)   Charity → Love, keyed on the CAUSE FAMILY
 *   E3  occasion ↔ charity (§2b)  Honour ↔ Charity
 *
 * 3 = a triad (exemplar); 2 = the seed bar; 0–1 never seeded. A star
 * means the topic HAPPENS AT the occasion (the constituent test: the
 * cake, the first dance, the funeral flowers) — one hop, legible on the
 * card with nothing else. Unstarred pairings are two hops (retirement →
 * time → travel → place) and the About must say the hop out loud.
 *
 * Two callers share this (§6): the seed picks a triple FROM the table;
 * the wizard's Generate is HANDED one and looks its edges up. Both get
 * the edges as text, not a judgement — a lookup, never a model call.
 *
 * Keys are live vocabulary: occasions are `occasion_type` strings from
 * OCCASION_TYPES_BY_REGISTER (lib/registers.ts); topics are catalogue
 * titles (scripts/seed.ts — a test guards the drift); charities are the
 * confirmed `cause_family`, with per-charity rows for the seeded ones
 * whose table row is sharper than their family's.
 *
 * HOLD (founder, 2026-09-23: "extra cautious"): review notes D, E and H
 * are NOT encoded — the homelessness charity→topic row, the health
 * charities where a topic could jar (Stroke → Word, Diabetes, Scope), and
 * the weak occasion↔charity rows (citizenship, career milestones, coming
 * out / divorce). Each needs the founder's individual approval first.
 *
 * Pure: imports types only, so a root script can import it relatively
 * (the precedent is scripts/backfill-cause-family.ts).
 */

export type TopicRow = { topic: string; star: boolean }

/** A §1 row: what the occasion pairs with, and the two sentences the
 *  edge text is built from — `at` for a starred topic (what happens at
 *  the occasion), `hop` for an unstarred one (the step the About must
 *  say). */
export type OccasionRow = {
  topics: TopicRow[]
  at: string
  hop: string
}

const t = (topic: string, star = false): TopicRow => ({ topic, star })

const MEMORIAL: OccasionRow = {
  topics: [
    t("Flower", true),
    t("Hymn", true),
    t("Poem", true),
    t("Song"),
    t("Saying"),
    t("Season"),
    t("Garden to visit"),
  ],
  at: "the flowers, the hymns and the readings of the service itself",
  // Empty on purpose: everyone knows a memorial remembers what the
  // person loved, and a written hop was quoted back verbatim ("What he
  // loved is what we remember today"; founder, 2026-09-24: verbose).
  hop: "",
}

const WEDDING: OccasionRow = {
  topics: [
    t("Song", true),
    t("Cake", true),
    t("Flower", true),
    t("Cocktail"),
    t("Dance"),
    t("Poem"),
    t("Type of holiday"),
    t("Island"),
    t("Beach"),
    t("Country"),
    t("Place"),
  ],
  at: "the first dance, the cake and the flowers of the day itself",
  hop: "the honeymoon, the venue, the reading chosen for the day",
}

const ACHIEVEMENT: OccasionRow = {
  topics: [
    t("Seaside town", true),
    t("National park", true),
    t("Landscape", true),
    t("Beach", true),
    t("Mountain or peak", true),
    t("River", true),
    t("Comfort food"),
    t("Song"),
    t("Form of exercise"),
    t("Weather"),
    t("Sporting moment"),
  ],
  at: "where the effort happened — the sea, the peak, the route",
  hop: "what got them through the training",
}

// The name on the card at a birth is the PARENTS'; the baby cannot have a
// favourite. The favourite is theirs, the one they will pass on (founder,
// 2026-09-24). BABY_OCCASIONS in story-engine.ts carries the rule.
const NEW_BABY: OccasionRow = {
  topics: [
    t("Children's book", true),
    t("Nursery rhyme", true),
    t("Name for a grandparent", true),
    t("Fairy tale"),
    t("Toy"),
    t("Cartoon"),
    t("Childhood game"),
    t("Season"),
  ],
  at: "the stories, rhymes and names that arrive with a new baby",
  hop: "a childhood about to begin",
}

const NEW_JOB: OccasionRow = {
  topics: [
    t("Cocktail"),
    t("Beer"),
    t("Wine"),
    t("Takeaway"),
    t("Coffee order"),
    t("Sandwich"),
    t("City"),
  ],
  at: "",
  hop: "the celebratory drink, or the working day they are stepping into",
}

/** §1 — occasion → topics, keyed on `occasion_type`. Occasions absent
 *  here (Celebration, Joint celebration, Just because, the neutral
 *  register) pair with nothing: known-fact motivation only. */
export const OCCASION_ROWS: Record<string, OccasionRow> = {
  // ── remembering ─────────────────────────────────────────────────────
  Remembrance: MEMORIAL,
  Memorial: MEMORIAL,
  "Celebration of life": MEMORIAL,
  Tribute: MEMORIAL,
  "In memoriam appeal": MEMORIAL,
  "Pet memorial": {
    topics: [
      t("Dog breed", true),
      t("Cat breed", true),
      t("Animal", true),
      t("Weather for walk"),
      t("Beach"),
      t("Toy"),
    ],
    at: "the animal being remembered",
    hop: "the walks and the places that were theirs together",
  },

  // ── celebrating_one ─────────────────────────────────────────────────
  Birthday: {
    topics: [
      t("Cake", true),
      t("Biscuit"),
      t("Sweet"),
      t("Ice cream flavour"),
      t("Pudding"),
      t("Board game"),
      t("Card game"),
      t("Song"),
    ],
    at: "the cake on the table",
    hop: "the treats and the games of a birthday tea",
  },
  "Milestone birthday": {
    topics: [
      t("Decade", true),
      t("Music era", true),
      t("Song"),
      t("Film"),
      t("TV theme tune"),
      t("Sweet"),
      t("Toy"),
    ],
    at: "the decade they were born in, and its music",
    hop: "a big birthday looks back at the years",
  },
  // Little HAPPENS at a retirement that maps to a topic — every pairing
  // is two hops ("now there's time"); like a memorial, the person
  // motivates it. Lean on E1′.
  Retirement: {
    topics: [
      t("Place"),
      t("Type of holiday"),
      t("Way to spend Sunday"),
      t("Garden to visit"),
      t("Hobby"),
      t("Way to travel"),
    ],
    at: "",
    hop: "now there is time — the freedom to finally go",
  },
  "Leaving do": {
    topics: [
      t("Beer"),
      t("Takeaway"),
      t("Coffee order"),
      t("Sandwich"),
      t("City"),
      t("Saying"),
    ],
    at: "",
    hop: "the leaving drinks, the office habits being left behind, or where they are going next",
  },
  Graduation: {
    topics: [
      t("School subject", true),
      t("Book"),
      t("Author"),
      t("Type of book"),
      t("City"),
      t("Takeaway"),
    ],
    at: "the subject they have just finished studying",
    hop: "the studying just done, and where they go next",
  },
  Christening: NEW_BABY,
  "New baby": NEW_BABY,
  "Baby shower": NEW_BABY,
  // Review note A: unranked deliberately — nothing starred.
  "Bar or bat mitzvah": {
    topics: [t("Song"), t("Film"), t("Book"), t("Sweet"), t("Board game")],
    at: "",
    hop: "a coming-of-age party",
  },
  Recovery: {
    topics: [
      t("Form of exercise"),
      t("Weather for walk"),
      t("Landscape"),
      t("Comfort food"),
      t("Song"),
      t("Way to spend Sunday"),
      t("Season"),
      t("Time of day"),
    ],
    at: "",
    hop: "back on their feet — the walks, the food and the days they can enjoy again",
  },
  "New job": NEW_JOB,
  Promotion: NEW_JOB,
  Achievement: ACHIEVEMENT,
  // Review note B: too broad to table; treated like Achievement —
  // "pick from what the award is for". Nothing starred.
  Award: {
    topics: [
      t("Saying"),
      t("Word"),
      t("Book"),
      t("Poem"),
      t("School subject"),
      t("Instrument"),
    ],
    at: "",
    hop: "what the award was given for",
  },
  "Exam success": {
    topics: [
      t("School subject", true),
      t("Way to spend Sunday"),
      t("Takeaway"),
      t("Sweet"),
      t("Book"),
    ],
    at: "the subject just passed",
    hop: "the reward after the revision",
  },
  "New home": {
    topics: [
      t("Part of a roast dinner"),
      t("Board game"),
      t("Way to spend Sunday"),
      t("Flower"),
      t("Tree"),
      t("Landmark or building"),
      t("County"),
      t("City"),
      t("Smell"),
    ],
    at: "",
    hop: "settling in — the first dinner, the first Sunday, the place itself",
  },
  Citizenship: {
    topics: [
      t("Type of tea", true),
      t("Weather", true),
      t("Biscuit"),
      t("Sandwich"),
      t("Word"),
      t("Regional or dialect word"),
      t("Saying"),
      t("TV programme"),
      t("Football team"),
      t("Seaside town"),
      t("Cuisine"),
    ],
    at: "the small British things a new citizen has taken on",
    hop: "the country being joined, and the one they came from",
  },
  // Review note C: kept to what makes no assumption on the person's behalf.
  "Coming out": {
    topics: [
      t("Song"),
      t("Musical"),
      t("Band or artist"),
      t("Film"),
      t("Decade"),
    ],
    at: "",
    hop: "the music and films that were theirs through it",
  },
  "Divorce party": {
    topics: [
      t("Cocktail", true),
      t("Wine"),
      t("Spirit"),
      t("Song"),
      t("Type of holiday"),
      t("Way to spend Sunday"),
    ],
    at: "the drink in hand — it is a party",
    hop: "the first solo trip, and the Sundays that are now their own",
  },

  // ── celebrating_many ────────────────────────────────────────────────
  Wedding: WEDDING,
  "Renewal of vows": {
    ...WEDDING,
    topics: [...WEDDING.topics, t("Decade")],
  },
  Engagement: {
    topics: [
      t("Gemstone", true),
      t("Song"),
      t("Cocktail"),
      t("Wine"),
      t("Type of holiday"),
      t("Island"),
      t("Beach"),
      t("Flower"),
      t("Place"),
    ],
    at: "the ring",
    hop: "the toast, and where it happened",
  },
  Anniversary: {
    topics: [
      t("Song", true),
      t("Decade", true),
      t("Music era"),
      t("Film"),
      t("Gemstone"),
      t("Cuisine"),
      t("Wine"),
      t("Type of holiday"),
      t("Dance"),
    ],
    at: "their song, and the year they married",
    hop: "the years together — the gift, the trips, the table",
  },
  Reunion: {
    topics: [
      t("Decade", true),
      t("Music era", true),
      t("Song"),
      t("School subject"),
      t("Childhood game"),
      t("Sweet"),
      t("Crisps"),
      t("TV theme tune"),
      t("Sitcom"),
      t("Cartoon"),
      t("Toy"),
      t("Video game"),
    ],
    at: "the years everyone shared",
    hop: "what everyone remembers from back then",
  },
  // The live vocabulary has ONE "Team celebration" (the table splits
  // sport from work), so nothing is starred: a sporting moment is not
  // what a work team celebrates.
  "Team celebration": {
    topics: [
      t("Sporting moment"),
      t("Sport to play"),
      t("Sport to watch"),
      t("Football team"),
      t("Rugby team"),
      t("Cricket team"),
      t("Beer"),
      t("Takeaway"),
      t("Biscuit"),
      t("Coffee order"),
      t("Sandwich"),
    ],
    at: "",
    hop: "the win itself, or the team's meal after it",
  },
  // The Christmas variant folds in unstarred — the topic itself says
  // Christmas; whether the gathering is one is not known here.
  "Family gathering": {
    topics: [
      t("Part of a roast dinner", true),
      t("Name for a grandparent", true),
      t("Board game", true),
      t("Card game"),
      t("Pudding"),
      t("Pie"),
      t("Way to spend Sunday"),
      t("Nursery rhyme"),
      t("Childhood game"),
      t("Christmas tradition"),
      t("Christmas film"),
      t("Christmas song"),
      t("Carol"),
    ],
    at: "the table, the names round it and the game after",
    hop: "what the family does when it is all together",
  },

  // ── cause ───────────────────────────────────────────────────────────
  // A cause favpoll's charity row (§2) comes through E2; these are the
  // EVENT pairings. Unstarred because the kind of fundraiser is unknown.
  Fundraiser: {
    topics: [
      t("Cake"),
      t("Biscuit"),
      t("Pie"),
      t("Cocktail"),
      t("Wine"),
      t("Card game"),
      t("Film"),
      t("Song"),
      t("Dance"),
    ],
    at: "",
    hop: "the event itself — a bake sale, a do, a casino night or a film night",
  },
  "Sponsored event": ACHIEVEMENT,
  "Charity night": {
    topics: [
      t("Cocktail", true),
      t("Wine"),
      t("Song"),
      t("Dance"),
      t("Card game"),
      t("Film"),
      t("Comedian"),
      t("Musical"),
      t("Cake"),
    ],
    at: "the drinks and the acts of the night",
    hop: "the night's entertainment",
  },
}

/** §2 — cause family → topics. `cause` is the plain phrase the E2 text
 *  names the family by. An empty row is deliberate: the family pairs via
 *  the person (§2b), or its rows are on HOLD. */
export const FAMILY_ROWS: Record<
  CauseFamily,
  { cause: string; topics: TopicRow[] }
> = {
  // The family row is a rehoming charity's: dogs and cats. The wild
  // topics (Sea creature, Butterfly, Insect) live on the RSPCA and WWF
  // rows only — a pet memorial for an octopus came out of the wider
  // row (fifth cohort, 2026-09-24).
  animals: {
    cause: "animals — rescue, welfare and wildlife",
    topics: [
      t("Animal", true),
      t("Dog breed"),
      t("Cat breed"),
      t("Bird"),
      t("Weather for walk"),
      t("Beach"),
    ],
  },
  children: {
    cause: "children and young people",
    topics: [
      t("Children's book", true),
      t("Toy", true),
      t("Fairy tale"),
      t("Nursery rhyme"),
      t("Cartoon"),
      t("Childhood game"),
      t("Sweet"),
      t("Ice cream flavour"),
      t("Dinosaur"),
      t("Superhero"),
      t("Planet"),
      t("Comic or annual"),
    ],
  },
  older_people: {
    cause: "older people",
    topics: [
      t("Decade"),
      t("Music era"),
      t("Way to spend Sunday"),
      t("Type of tea"),
      t("Biscuit"),
      t("Radio station"),
      t("Saying"),
      t("Dance"),
      t("Sitcom"),
    ],
  },
  // Hospices, Marie Curie, Macmillan: pair via the PERSON (§2b) — no
  // charity→topic row. Alzheimer's Society has its own row below.
  end_of_life: { cause: "end-of-life care and dementia", topics: [] },
  // Review note E (HOLD) — only the per-charity rows below (BHF, RNIB).
  health_condition: { cause: "a health condition", topics: [] },
  mental_health: {
    cause: "mental health",
    topics: [
      t("Song"),
      t("Way to spend Sunday"),
      t("Weather for walk"),
      t("Landscape"),
      t("Form of exercise"),
      t("Book"),
      t("Hobby"),
      t("Sound"),
      t("Time of day"),
    ],
  },
  // Review note D (HOLD) — the "topics of home" row is not encoded.
  homelessness: { cause: "homelessness and housing", topics: [] },
  food_poverty: {
    cause: "food banks and food poverty",
    topics: [
      t("Part of a roast dinner", true),
      t("Comfort food", true),
      t("Meal of the day"),
      t("Breakfast cereal"),
      t("Sandwich"),
      t("Pie"),
      t("Type of tea"),
    ],
  },
  environment_heritage: {
    cause: "the natural environment and heritage places",
    topics: [
      t("Tree"),
      t("Landscape"),
      t("National park"),
      t("Beach"),
      t("Season"),
      t("Garden to visit"),
    ],
  },
  // Rescue is a family (lifeboats, mountain rescue, air ambulance); the
  // sea topics were the RNLI's own and now live on its row. "Mountain
  // Rescue works for lifeboats and rescue at sea" failed the judge
  // (fifth cohort, 2026-09-24).
  sea_rescue: {
    cause: "rescue — lifeboats, mountain rescue, air ambulance",
    topics: [t("Weather")],
  },
  // Review note F (not HOLD): risks reading as a holiday — kept as tabled.
  international: {
    cause: "overseas aid and humanitarian relief",
    topics: [
      t("Country", true),
      t("Cuisine"),
      t("Way to travel"),
      t("Weather"),
      t("River"),
    ],
  },
  entertainment: {
    cause: "fundraising through comedy and entertainment",
    topics: [
      t("Comedian", true),
      t("Sitcom", true),
      t("TV programme"),
      t("Saying"),
      t("Song"),
    ],
  },
}

/** Charities whose table row is sharper than their family's. Keyed on
 *  the name as seeded (scripts/seed.ts) or as added from the register
 *  on staging (REGISTER_ADDED), matched loosely. */
export const REGISTER_ADDED = ["Mountain Rescue England and Wales"] as const
export const CHARITY_ROWS: Record<string, TopicRow[]> = {
  RNLI: [
    t("Seaside town", true),
    t("Beach", true),
    t("Sea creature"),
    t("Island"),
    t("Weather"),
    t("Way to travel"),
  ],
  "Mountain Rescue England and Wales": [
    t("Mountain or peak", true),
    t("National park", true),
    t("Landscape"),
    t("Weather for walk"),
    t("Weather"),
  ],
  "Dogs Trust": [
    t("Dog breed", true),
    t("Animal"),
    t("Weather for walk"),
    t("Beach"),
  ],
  RSPCA: [
    t("Animal", true),
    t("Dog breed"),
    t("Cat breed"),
    t("Bird"),
    t("Butterfly"),
    t("Insect"),
  ],
  WWF: [
    t("Animal", true),
    t("Sea creature"),
    t("Bird"),
    t("Butterfly"),
    t("Tree"),
    t("Landscape"),
    t("Island"),
    t("National park"),
    t("River"),
    t("Mountain or peak"),
    t("Planet"),
  ],
  "National Trust": [
    t("Castle", true),
    t("Garden to visit", true),
    t("Landmark or building"),
    t("National park"),
    t("Tree"),
    t("Landscape"),
    t("Beach"),
    t("Weather for walk"),
    t("Season"),
    t("Famous painting"),
  ],
  // Music is the last thing to go.
  "Alzheimer's Society": [
    t("Song", true),
    t("Music era"),
    t("Decade"),
    t("Smell"),
    t("Saying"),
    t("TV theme tune"),
    t("Hymn"),
    t("Childhood game"),
    t("Sweet"),
  ],
  "British Heart Foundation": [
    t("Form of exercise", true),
    t("Sport to play"),
    t("Weather for walk"),
    t("Landscape"),
    t("National park"),
    t("Vegetable"),
    t("Fruit"),
  ],
  // The non-visual senses.
  RNIB: [
    t("Sound", true),
    t("Smell", true),
    t("Radio station", true),
    t("Instrument"),
    t("Song"),
    t("Weather"),
  ],
}

/** §2b — occasion ↔ charity, keyed on occasion type × cause family.
 *  `why` is the edge text's reason. Review note H rows are NOT here. */
export type HonourCharityRow = {
  occasions: string[]
  family: CauseFamily
  star: boolean
  why: string
  /** Seeded charities the row's reason does not fit: the health family
   *  spans cancer and heart (which take people) and sight loss and
   *  disability equality (which do not). "RNIB fights the sight loss
   *  that takes people" was written from this row (2026-09-24). */
  except?: string[]
}

const MEMORIAL_OCCASIONS = [
  "Remembrance",
  "Memorial",
  "Celebration of life",
  "Tribute",
]
const NEW_BABY_OCCASIONS = ["Christening", "New baby", "Baby shower"]

export const HONOUR_CHARITY_ROWS: HonourCharityRow[] = [
  {
    occasions: MEMORIAL_OCCASIONS,
    family: "end_of_life",
    star: true,
    why: "a charity that cares for people at the end of life belongs at a memorial — whoever cared for them",
  },
  {
    occasions: MEMORIAL_OCCASIONS,
    family: "health_condition",
    star: false,
    why: "a charity that fights the kind of illness that takes people belongs at a memorial",
    except: ["RNIB", "Scope"],
  },
  {
    occasions: ["Pet memorial"],
    family: "animals",
    star: true,
    why: "an animal charity, for an animal being remembered",
  },
  {
    occasions: NEW_BABY_OCCASIONS,
    family: "children",
    star: true,
    why: "a children's charity at the start of a life",
  },
  {
    occasions: ["Milestone birthday", "Retirement", "Anniversary"],
    family: "older_people",
    star: true,
    why: "a long life, honoured through a charity for older people",
  },
  {
    occasions: ["Recovery"],
    family: "health_condition",
    star: true,
    why: "the condition's own charity, at a recovery",
    except: ["RNIB", "Scope"],
  },
  {
    occasions: ["Recovery"],
    family: "mental_health",
    star: true,
    why: "the condition's own charity, at a recovery",
  },
  {
    occasions: ["Achievement", "Sponsored event"],
    family: "sea_rescue",
    star: true,
    why: "the cause the effort is for — a swim for the lifeboats, a climb for mountain rescue",
  },
  {
    occasions: ["Achievement", "Sponsored event"],
    family: "health_condition",
    star: true,
    why: "the cause the effort is for",
  },
  {
    occasions: ["Achievement", "Sponsored event"],
    family: "mental_health",
    star: false,
    why: "the cause the effort is for",
  },
  {
    occasions: ["Wedding", "Engagement", "Renewal of vows"],
    family: "homelessness",
    star: true,
    why: "a home for someone else, given in lieu of gifts",
  },
  {
    occasions: ["New home"],
    family: "homelessness",
    star: true,
    why: "the mirror of one's own good fortune: a home",
  },
  {
    occasions: ["Family gathering", "Reunion"],
    family: "older_people",
    star: false,
    why: "a full house, and a charity for those who are on their own",
  },
  {
    occasions: ["Family gathering", "Reunion"],
    family: "food_poverty",
    star: false,
    why: "a full table, and a charity that fills other people's",
  },
]

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export type Edge = { text: string; star: boolean }

export type StoryEdges = {
  /** occasion → topic (§1) */
  e1: Edge | null
  /** charity → topic (§2) */
  e2: Edge | null
  /** occasion ↔ charity (§2b). Always null for the cause register: there
   *  the charity IS the occasion, and the Honour vertex does not exist. */
  e3: Edge | null
  count: 0 | 1 | 2 | 3
}

export type EdgeLookupInput = {
  register: Register
  /** An `occasion_type` string. Null = the register's default, which
   *  pairs with nothing. */
  occasionType: string | null
  topicTitle: string
  charityName: string | null
  /** The admin-CONFIRMED family only — never the model's suggestion. */
  causeFamily: CauseFamily | null
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[‘’]/g, "'")

function findOccasionRow(occasionType: string | null): {
  key: string
  row: OccasionRow
} | null {
  if (!occasionType) return null
  const want = norm(occasionType)
  for (const [key, row] of Object.entries(OCCASION_ROWS)) {
    if (norm(key) === want) return { key, row }
  }
  return null
}

function findTopic(rows: TopicRow[], topicTitle: string): TopicRow | null {
  const want = norm(topicTitle)
  return rows.find((r) => norm(r.topic) === want) ?? null
}

function charityRow(charityName: string | null): TopicRow[] | null {
  if (!charityName) return null
  const want = norm(charityName)
  for (const [name, row] of Object.entries(CHARITY_ROWS)) {
    if (norm(name) === want) return row
  }
  return null
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a")

/** Look a triple's edges up. A lookup, never a judgement. */
export function lookupEdges(input: EdgeLookupInput): StoryEdges {
  const topic = input.topicTitle.trim().toLowerCase()
  const occ = findOccasionRow(input.occasionType)

  // E1 — occasion → topic
  let e1: Edge | null = null
  if (occ) {
    const hit = findTopic(occ.row.topics, input.topicTitle)
    if (hit) {
      const occasion = occ.key.toLowerCase()
      e1 = hit.star
        ? {
            star: true,
            text: `A favourite ${topic} is part of ${article(occasion)} ${occasion}: ${occ.row.at}.`,
          }
        : occ.row.hop
          ? {
              star: false,
              text: `${article(occasion) === "an" ? "An" : "A"} ${occasion} suggests a favourite ${topic} only by a step the about must say out loud: ${occ.row.hop}.`,
            }
          : {
              star: false,
              text: `A favourite ${topic} suits ${article(occasion)} ${occasion}; that needs no saying in the about.`,
            }
    }
  }

  // E2 — charity → topic (the charity's own row beats its family's)
  let e2: Edge | null = null
  if (input.charityName && input.causeFamily) {
    const family = FAMILY_ROWS[input.causeFamily]
    const rows = charityRow(input.charityName) ?? family.topics
    const hit = findTopic(rows, input.topicTitle)
    if (hit) {
      e2 = {
        star: hit.star,
        text: `${input.charityName} works for ${family.cause}: a favourite ${topic} ${hit.star ? "is at the heart of what they do" : "sits inside that cause"}.`,
      }
    }
  }

  // E3 — occasion ↔ charity. No Honour vertex for a cause favpoll.
  let e3: Edge | null = null
  if (
    input.register !== "cause" &&
    occ &&
    input.charityName &&
    input.causeFamily
  ) {
    const want = norm(occ.key)
    const name = norm(input.charityName)
    const row = HONOUR_CHARITY_ROWS.find(
      (r) =>
        r.family === input.causeFamily &&
        r.occasions.some((o) => norm(o) === want) &&
        !(r.except ?? []).some((x) => norm(x) === name)
    )
    if (row) {
      e3 = {
        star: row.star,
        text: `${input.charityName} belongs at ${article(occ.key)} ${occ.key.toLowerCase()}: ${row.why}.`,
      }
    }
  }

  const count = [e1, e2, e3].filter(Boolean).length as 0 | 1 | 2 | 3
  return { e1, e2, e3, count }
}
