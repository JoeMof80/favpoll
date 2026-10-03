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

export type TopicRow = {
  /** A topic title — or a SUBSET's (favpoll-topic-rules §1, step 5): a row
   *  may name "Wedding song" on Song. A subset with no row of its own
   *  inherits its parent's row. */
  topic: string
  star: boolean
  /** The concrete thing that links this topic to the occasion, when the
   *  row's general hop is too abstract to write from ("settling in has
   *  put a roast dinner on her mind"; founder, 2026-09-26). The table's
   *  own parentheticals, made data. */
  why?: string
  /** ENACTED: the guests' picks decide something on the night, so the
   *  favpoll needs no favourite of the group's own. The outcome, as the
   *  closing sentence will promise it ("the top ten are the playlist for
   *  the night"; founder, 2026-09-26: a reunion's Song IS the playlist).
   *  A crowd has no favourite of its own, which is why the reunion's rows
   *  read this way by default. */
  enacted?: string
  /** A PROVISION READING that is available but NOT the default (section D
   *  of the revisit, 2026-10-01, entered 2026-10-03). The row stays a
   *  memento star — a birthday's favourite party board game is theirs —
   *  and this is the sentence the organiser's Generate switch uses when
   *  they say the picks decide the night, in place of the generic "the
   *  top five are the picks for the night". The switch decides; the row
   *  only supplies the better words. */
  outcome?: string
}

/** A §1 row: what the occasion pairs with, and the two sentences the
 *  edge text is built from — `at` for a starred topic (what happens at
 *  the occasion), `hop` for an unstarred one (the step the About must
 *  say). */
export type OccasionRow = {
  topics: TopicRow[]
  at: string
  hop: string
}

/** An enacted topic: starred, and the outcome is the promise. */
const enact = (topic: string, outcome: string): TopicRow => ({
  topic,
  star: true,
  enacted: outcome,
})
const t = (topic: string, star = false, why?: string): TopicRow =>
  why ? { topic, star, why } : { topic, star }
/** A starred memento row that ALSO offers a provision reading. */
const provision = (topic: string, outcome: string): TopicRow => ({
  topic,
  star: true,
  outcome,
})

/** Every SUBSET the table names, with its parent topic (favpoll-topic-
 *  rules §1, step 5; the revisit of 2026-10-01, ticked by the founder on
 *  2026-10-02). A row may name a subset only if it is listed here, and
 *  the drift guard holds each parent to the catalogue. APPROVED subsets
 *  only: a row cannot name what no poll can carry, and the founder
 *  rejected the rest on /subsets. The ticked ones the September scan
 *  review had rejected were approved on 2026-10-02 and their rows are
 *  here. */
/** Subsets that CARRY AN OCCASION OR A REGISTER of their own, and so
 *  must never be borrowed. Inheritance is right for an ordinary slice —
 *  a Scottish island is an island wherever islands pair — and wrong for
 *  these, as two exemplar cohorts on 2026-10-02 showed: Wedding song
 *  inheriting Song put "favourite wedding song" on a REMEMBRANCE,
 *  Sunday roast inheriting Comfort food put it on an achievement, and
 *  Karaoke song inheriting Song asked a WAKE for its favourite karaoke
 *  number. The first seven name an occasion outright (the revisit of
 *  2026-10-01, section A); Karaoke song names a kind of night, which
 *  section E says is loud rather than tasteless everywhere except the
 *  one place it is both. They pair where a row names them, and nowhere
 *  else. */
const NEVER_INHERIT = new Set([
  "Cheese board",
  "Christmas carol",
  "Christmas classic",
  "Family Christmas film",
  "Christmas number one",
  "Sunday roast",
  "Wedding song",
  "Karaoke song",
])

export const SUBSET_PARENTS: Record<string, string> = {
  "Name for a grandmother": "Name for a grandparent",
  "Surfing beach": "Beach",
  "British beach": "Beach",
  "British mountain": "Mountain or peak",
  "British river": "River",
  "World river": "River",
  "Party board game": "Board game",
  "Classic board game": "Board game",
  "Children's board game": "Board game",
  "Karaoke song": "Song",
  "Wedding song": "Song",
  "Ballroom dance": "Dance",
  "Greek island": "Island",
  "Beach holiday destination": "Country",
  "Roast dinner meat": "Part of a roast dinner",
  "Roast dinner vegetable": "Part of a roast dinner",
  "Takeaway curry": "Takeaway",
  "Outdoor activity": "Hobby",
  Berry: "Fruit",
  "Citrus fruit": "Fruit",
  "Family dog breed": "Dog breed",
  "Small dog breed": "Dog breed",
  "Working dog breed": "Dog breed",
  Pet: "Animal",
  "Farm animal": "Animal",
  "Garden bird": "Bird",
  "Bird of prey": "Bird",
  "English castle": "Castle",
  "Welsh castle": "Castle",
  "Ancient ruin": "Landmark or building",
  "Nature sound": "Sound",
  "Music radio station": "Radio station",
  Songbird: "Bird",
  "Water bird": "Bird",
  // Approved 2026-10-02 — the founder's ticks over the September scan
  // review (scripts/approve-ticked-subsets.ts).
  "Picture book": "Children's book",
  // Sunday roast is a subset of THREE topics (Comfort food, Vegetable,
  // Sauce or condiment); the guard only needs one real parent.
  "Sunday roast": "Comfort food",
  "British pudding": "Pudding",
  "Christmas carol": "Carol",
  "Christmas classic": "Christmas film",
  "Family Christmas film": "Christmas film",
  "Christmas number one": "Christmas song",
  "Cheese board": "Cheese",
  "Childhood favourite": "Cartoon",
  "British proverb": "Proverb",
  "Life advice": "Proverb",
  "Bucket and spade beach": "Seaside town",
  "Fishing village": "Seaside town",
  "Comfort smell": "Smell",
  "Fruit tree": "Tree",
  "Scented flower": "Flower",
  "Spring flower": "Flower",
  "Leafy green": "Vegetable",
  "Salad vegetable": "Vegetable",
  Terrier: "Dog breed",
  "Garden insect": "Insect",
  "Seaside castle": "Castle",
  "Sunday service": "Hymn",
  "BBC station": "Radio station",
}

const MEMORIAL: OccasionRow = {
  topics: [
    t("Flower", true),
    t("Hymn", true),
    t("Poem", true),
    t("Song"),
    // The proverb she repeated IS something only she could tell you, so
    // the subset passes the memorial test where its parent did not.
    t("Life advice", false, "what she always said"),
    // Saying was here: a person can be known for one, but guests at a
    // wake have no favourite saying to pick (founder, 2026-09-25). The
    // topic was renamed PROVERB on 2026-10-02 — the list was always
    // proverbs while the name promised the phrase they always reached
    // for, which is the mismatch that made it awkward twice.
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
    // The first dance is a ballroom dance; the honeymoon, sharpened
    // (ticked 2026-10-02). Wedding song and Wedding flower belong to the
    // anniversary: before the day they leak, after it they are heard.
    t("Ballroom dance", true),
    t("Greek island", false, "the honeymoon"),
    t("Beach holiday destination", false, "the honeymoon"),
  ],
  at: "the first dance, the cake and the flowers of the day itself",
  hop: "the honeymoon or the venue",
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
    // The British kinds of place, where the effort happened (ticked
    // 2026-10-02): a star only once the organiser has picked the subset,
    // which is the disclosure that the climb or the swim was here.
    t("Surfing beach", true),
    t("British mountain", true),
    t("British river", true),
    t("Song"),
    t("Form of exercise"),
    t("Weather"),
    t("Sporting moment"),
  ],
  at: "where the effort happens — the sea, the peak, the route",
  hop: "the training",
}

// The name on the card at a birth is the PARENTS'; the baby cannot have a
// favourite. The favourite is theirs, the one they will pass on (founder,
// 2026-09-24). BABY_OCCASIONS in story-engine.ts carries the rule.
const NEW_BABY: OccasionRow = {
  topics: [
    t("Children's book", true),
    // What is actually read to a baby; the talking animals come later.
    t("Picture book", true),
    t("Nursery rhyme", true),
    t("Name for a grandparent", true),
    t("Fairy tale"),
    // The subset that names the pair (ticked 2026-10-02).
    t("Name for a grandmother", true),
    t("Toy"),
    t("Cartoon"),
    t("Childhood game"),
    t("Season"),
  ],
  at: "the stories, rhymes and names that arrive with a new baby",
  hop: "",
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
  hop: "the celebratory drink",
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
      t("Weather for walking"),
      t("Beach"),
      t("Toy"),
    ],
    at: "the animal being remembered",
    hop: "the walks that were theirs",
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
      // Played and sung at the party (ticked 2026-10-02). Both carry a
      // PROVISION reading for the Generate switch (section D).
      provision(
        "Party board game",
        "the winner is the game that comes out after the cake"
      ),
      provision("Karaoke song", "the top ten are the set list for the night"),
    ],
    at: "the cake on the table",
    hop: "a birthday tea",
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
    hop: "a big birthday looks back",
  },
  // Little HAPPENS at a retirement that maps to a topic — every pairing
  // is two hops ("now there's time"); like a memorial, the person
  // motivates it. Lean on E1′.
  Retirement: {
    topics: [
      t("Place", false, "the freedom to finally go"),
      t("Type of holiday", false, "the freedom to finally go"),
      t("Way to spend Sunday", false, "every day a Sunday now"),
      t("Garden to visit", false, "the days out there is finally time for"),
      t("Hobby", false, "the hobby there is finally time for"),
      t(
        "Outdoor activity",
        false,
        "the days outdoors there is finally time for"
      ),
      t("Way to travel", false, "the freedom to finally go"),
    ],
    at: "",
    hop: "now there is time — the freedom to finally go",
  },
  // Saying was here too: "favourite saying" is awkward as a poll
  // (founder, 2026-09-25, the second time).
  "Leaving do": {
    topics: [
      t("Beer", false, "the leaving drinks"),
      t("Takeaway", false, "the leaving-night takeaway"),
      // The leaving curry is a British office ritual, and the one row here
      // the picks can actually decide (section D).
      provision("Takeaway curry", "the winner is the order on the last day"),
      t("Coffee order", false, "the office coffee run they are leaving behind"),
      t("Sandwich", false, "the desk lunches they are leaving behind"),
      t("City", false, "where they are going next"),
    ],
    at: "",
    hop: "the leaving drinks, or where they are going next",
  },
  Graduation: {
    topics: [
      t("School subject", true),
      t("Book", false, "reading for pleasure again after the reading list"),
      t("Author", false, "reading for pleasure again after the reading list"),
      t(
        "Type of book",
        false,
        "reading for pleasure again after the reading list"
      ),
      t("City", false, "where they go next"),
      t("Takeaway", false, "the late-night takeaways of the final year"),
    ],
    at: "the subject they have just finished studying",
    hop: "the studying just done",
  },
  Christening: NEW_BABY,
  "New baby": NEW_BABY,
  "Baby shower": NEW_BABY,
  // Review note A: unranked deliberately — nothing starred.
  "Bar or bat mitzvah": {
    topics: [t("Song"), t("Film"), t("Book"), t("Sweet"), t("Board game")],
    at: "",
    hop: "",
  },
  Recovery: {
    topics: [
      t("Form of exercise"),
      t("Outdoor activity", false, "being back outdoors, on their feet again"),
      t("Weather for walking"),
      t("Landscape"),
      t("Comfort food"),
      t("Song"),
      t("Way to spend Sunday"),
      t("Season"),
      t("Time of day"),
    ],
    at: "",
    hop: "being back on their feet",
  },
  "New job": NEW_JOB,
  Promotion: NEW_JOB,
  Achievement: ACHIEVEMENT,
  // Review note B: too broad to table; treated like Achievement —
  // "pick from what the award is for". Nothing starred.
  Award: {
    topics: [
      t("Word"),
      t("Book"),
      t("Poem"),
      t("School subject"),
      t("Instrument"),
    ],
    at: "",
    hop: "what the award is for",
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
      t(
        "Part of a roast dinner",
        false,
        "the first roast cooked for friends in the new place"
      ),
      t("Board game", false, "the first games night in the new place"),
      t("Way to spend Sunday", false, "the first Sunday in the new place"),
      t("Flower", false, "the garden that comes with the house"),
      t("Tree", false, "the garden that comes with the house"),
      t("Landmark or building", false, "the place they have moved to"),
      t("County", false, "the place they have moved to"),
      t("City", false, "the place they have moved to"),
      t("Smell", false, "a house becoming a home"),
      t("Comfort smell", false, "a house becoming a home"),
      t("Fruit tree", false, "the garden that comes with the house"),
    ],
    at: "",
    hop: "settling in",
  },
  Citizenship: {
    topics: [
      t("Type of tea", true),
      t("Weather", true),
      t("Biscuit"),
      t("Sandwich"),
      t("Word"),
      t("Regional or dialect word"),
      t("Proverb"),
      // Britishness IS the constituent here, so the British slice stars
      // where its parent only gestures (ticked 2026-10-02).
      t("British proverb", true),
      t(
        "Bucket and spade beach",
        false,
        "the British seaside, bucket and spade"
      ),
      t("TV programme"),
      t("Football team"),
      t("Seaside town"),
      t("Cuisine"),
    ],
    at: "the small British things a new citizen has taken on",
    hop: "the country being joined",
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
    hop: "",
  },
  "Divorce party": {
    topics: [
      t("Cocktail", true),
      t("Wine"),
      t("Spirit"),
      t("Song"),
      t("Type of holiday"),
      t("Way to spend Sunday"),
      // If it is that kind of party (ticked 2026-10-02).
      provision("Karaoke song", "the top ten are the set list for the night"),
    ],
    at: "the drink in hand — it is a party",
    hop: "the first solo trip",
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
    hop: "where it happened",
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
      // Their song was the first dance (ticked 2026-10-02).
      t("Wedding song", true),
      t("Ballroom dance", true),
    ],
    at: "their song, and the year they married",
    hop: "the years together",
  },
  // A reunion is of people who were teenagers or adults together, so the
  // small-child nostalgia (toys, playground games) is off the row: "by
  // the time kids leave school, sweets aren't very important" (founder,
  // 2026-09-26). A crowd has no favourite of its own, so the topics that
  // work best are ENACTED: the picks become the playlist, the board, the
  // bowls on the tables. Sweet survives only that way, as a tuck-shop
  // bowl in passing.
  Reunion: {
    topics: [
      enact("Song", "the top ten are the playlist for the night"),
      enact("Cheese", "the winners go on the board"),
      enact("Crisps", "the winners go on the bar"),
      enact("Sweet", "the winners fill the bowls on the tables"),
      // The night's karaoke IS the enacted outcome (ticked 2026-10-02).
      enact("Karaoke song", "the top ten are the karaoke list for the night"),
      // The subset names the enacted thing exactly (ticked 2026-10-02).
      enact("Cheese board", "the winners go on the board"),
      enact("Sunday roast", "the winner is the roast"),
      t("Childhood favourite", false, "what everyone watched then"),
      t("Decade", true),
      t("Music era", true),
      t("School subject"),
      t("TV theme tune"),
      t("Sitcom"),
      t("Cartoon"),
      t("Video game"),
    ],
    at: "the years everyone shared",
    hop: "what everyone remembers",
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
      provision("Takeaway curry", "the winner is the order on the last day"),
      t("Biscuit"),
      t("Coffee order"),
      t("Sandwich"),
    ],
    at: "",
    hop: "the win, or the meal after",
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
      // The subsets that name the table and the game (ticked 2026-10-02),
      // each carrying the PROVISION reading section D drafted: a family
      // gathering is the occasion where the picks most often decide what
      // actually happens, and the switch is what turns them on.
      provision("Roast dinner meat", "the winner is the joint on the table"),
      provision(
        "Roast dinner vegetable",
        "the top three are on the table beside it"
      ),
      // Three topics hold a "Sunday roast" subset; at a family gathering
      // it is the constituent (ticked 2026-10-02).
      provision("Sunday roast", "the winner is the roast"),
      t("British pudding"),
      provision(
        "Christmas carol",
        "the top five are the carols the family sings"
      ),
      provision("Christmas classic", "the winner is the film after dinner"),
      provision("Family Christmas film", "the winner is the film after dinner"),
      provision(
        "Christmas number one",
        "the top ten are the playlist for the day"
      ),
      t("Name for a grandmother", true),
      provision(
        "Classic board game",
        "the winner is the game that comes out after lunch"
      ),
      t("Children's board game", true),
    ],
    at: "the table, the names round it and the game after",
    hop: "",
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
    hop: "the event itself",
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
      // The first row a charity night has that the picks can decide.
      provision("Karaoke song", "the top ten are the set list for the night"),
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
      t("Weather for walking"),
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
      t("Proverb"),
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
      t("Weather for walking"),
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
  // Review note F came true: "humanitarian work reaches rivers" was
  // the model stretching to River (founder, 2026-09-25: "very tenuous
  // and contrived"). Country and Cuisine stay; the rest go.
  international: {
    cause: "overseas aid and humanitarian relief",
    topics: [t("Country", true), t("Cuisine")],
  },
  entertainment: {
    cause: "fundraising through comedy and entertainment",
    topics: [
      t("Comedian", true),
      t("Sitcom", true),
      t("TV programme"),
      t("Proverb"),
      t("Song"),
    ],
  },
}

/** Charities whose table row is sharper than their family's. Keyed on
 *  the name as seeded (scripts/seed.ts) or as added from the register
 *  on staging (REGISTER_ADDED), matched loosely. */
export const REGISTER_ADDED = [
  "Mountain Rescue England and Wales",
  "Guide Dogs",
  "Royal Horticultural Society",
  "Cats Protection",
  "RSPB",
] as const
export const CHARITY_ROWS: Record<string, TopicRow[]> = {
  RNLI: [
    t("Seaside town", true),
    t("Beach", true),
    // The coast they cover (ticked 2026-10-02); Fishing village waits on
    // its approval on /subsets.
    t("British beach", true),
    t("Surfing beach", true),
    t("Fishing village", true),
    t("Sea creature"),
    t("Island"),
    t("Weather"),
    t("Way to travel"),
  ],
  // The RHS is gardens: the first charity added because a seeded
  // favpoll deserved an apter one (Barry's retirement; founder,
  // 2026-09-26).
  "Royal Horticultural Society": [
    t("Garden to visit", true),
    t("Flower", true),
    t("Tree"),
    t("Vegetable"),
    t("Fruit"),
    t("Berry"),
    t("Scented flower", true),
    t("Spring flower", true),
    t("Fruit tree"),
    t("Leafy green"),
  ],
  // Guide Dogs breeds and trains its own dogs: the one health charity
  // whose topic is an animal.
  // Section B's one gap, closed 2026-10-02 once Working dog breed was
  // approved: the herders, retrievers and guardians, which is the half
  // of the list Guide Dogs actually breeds and trains.
  "Guide Dogs": [
    t("Dog breed", true),
    t("Working dog breed", true),
    t("Animal"),
    t("Weather for walking"),
  ],
  "Mountain Rescue England and Wales": [
    t("Mountain or peak", true),
    // They rescue on British mountains, not Everest (ticked 2026-10-02).
    t("British mountain", true),
    t("National park", true),
    t("Landscape"),
    t("Weather for walking"),
    t("Weather"),
  ],
  // The RSPB fell through to the animals family row too, which offers
  // Dog breed and Cat breed — the Rufus shape again, a birds charity
  // asked for a favourite dog. Garden bird is their confirmed subset:
  // the Big Garden Birdwatch is their own.
  RSPB: [
    t("Bird", true),
    t("Garden bird", true),
    t("Bird of prey"),
    t("Songbird"),
    t("Water bird"),
    t("Tree"),
    t("Season"),
    t("Weather for walking"),
  ],
  // Cats Protection had NO row until 2026-10-03 and fell through to the
  // animals family row, which lists Dog breed — so a cats charity was
  // offered a favourite dog breed (the Rufus exemplar: a dog's memorial
  // raising for cats, scored three edges). A species charity pairs on
  // its own species.
  "Cats Protection": [
    t("Cat breed", true),
    t("Animal"),
    t("Weather for walking"),
  ],
  "Dogs Trust": [
    t("Dog breed", true),
    t("Family dog breed", true),
    t("Small dog breed", true),
    t("Terrier"),
    t("Animal"),
    t("Weather for walking"),
    t("Beach"),
    t("British beach"),
  ],
  RSPCA: [
    t("Animal", true),
    // The remit exactly (ticked 2026-10-02); Zoo animal is not.
    t("Pet", true),
    t("Farm animal", true),
    t("Dog breed"),
    t("Cat breed"),
    t("Bird"),
    t("Garden bird"),
    t("Garden insect"),
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
    // WWF's rivers work is global (ticked 2026-10-02).
    t("World river", true),
    t("Bird of prey"),
    t("Mountain or peak"),
    t("Planet"),
  ],
  "National Trust": [
    t("Castle", true),
    // All theirs: the castles, the ruins and the coast (ticked
    // 2026-10-02); Seaside castle waits on its approval on /subsets.
    t("English castle", true),
    t("Welsh castle", true),
    t("Seaside castle", true),
    t("Ancient ruin", true),
    t("British beach", true),
    t("Garden to visit", true),
    t("Landmark or building"),
    t("National park"),
    t("Tree"),
    t("Landscape"),
    t("Beach"),
    t("Weather for walking"),
    t("Season"),
    t("Famous painting"),
  ],
  // Music is the last thing to go.
  "Alzheimer's Society": [
    t("Song", true),
    t("Music era"),
    t("Decade"),
    t("Smell"),
    // Reminiscence: the sharper cues (ticked 2026-10-02).
    t("Comfort smell", true),
    t("Proverb"),
    t("Life advice"),
    t("TV theme tune"),
    t("Hymn"),
    t("Sunday service"),
    t("Childhood game"),
    t("Sweet"),
  ],
  "British Heart Foundation": [
    t("Form of exercise", true),
    // Heart-healthy, specifically (ticked 2026-10-02).
    t("Outdoor activity", true),
    t("Citrus fruit"),
    t("Berry"),
    t("Leafy green"),
    t("Salad vegetable"),
    t("Sport to play"),
    t("Weather for walking"),
    t("Landscape"),
    t("National park"),
    t("Vegetable"),
    t("Fruit"),
  ],
  // The non-visual senses.
  RNIB: [
    t("Sound", true),
    t("Nature sound", true),
    t("Smell", true),
    t("Radio station", true),
    t("Music radio station", true),
    t("BBC station", true),
    t("Comfort smell", true),
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
    except: ["RNIB", "Scope", "Guide Dogs"],
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
    except: ["RNIB", "Scope", "Guide Dogs"],
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

export type Edge = {
  text: string
  star: boolean
  /** The outcome on the night, when the guests' picks are enacted. */
  enacted?: string
  /** The provision sentence this row OFFERS the Generate switch, for a
   *  row that is a memento by default (TopicRow.outcome). */
  outcome?: string
}

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
  /** The name on the card: the subset's when the poll has one. */
  topicTitle: string
  /** The parent topic's title when topicTitle is a subset's; a subset
   *  with no row of its own inherits the parent's edges. */
  parentTopicTitle?: string | null
  charityName: string | null
  /** The admin-CONFIRMED family only — never the model's suggestion. */
  causeFamily: CauseFamily | null
  /** The charity's own confirmed PERFECT TOPIC (2026-09-26), when it has
   *  one: beats every table row for the charity→topic edge. */
  charityTopic?: {
    title: string
    /** The charity's confirmed perfect SUBSET, when it has one. */
    subsetTitle?: string | null
    reason: string | null
  } | null
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[‘’]/g, "'")

/** A PET MEMORIAL IS FOR ONE ANIMAL, and a charity that works for one
 *  species does not belong at another's (founder, 2026-10-03, reading
 *  the seeded cohort: "favourite dog breed for Cats Protection?"). The
 *  topic on the card is what names the species — there is no species
 *  field — so a dog topic beside a cats charity is the contradiction,
 *  whatever the edges would otherwise score. Charities that work for
 *  both (Battersea, Blue Cross, the RSPCA) are deliberately absent:
 *  they belong at either. */
type Species = "dog" | "cat" | "bird"

const CHARITY_SPECIES: Record<string, Species> = {
  "Cats Protection": "cat",
  "Dogs Trust": "dog",
  "Guide Dogs": "dog",
  RSPB: "bird",
}

const TOPIC_SPECIES: Record<string, Species> = {
  "Dog breed": "dog",
  "Family dog breed": "dog",
  "Small dog breed": "dog",
  "Working dog breed": "dog",
  Terrier: "dog",
  "Cat breed": "cat",
  Bird: "bird",
  "Garden bird": "bird",
  "Bird of prey": "bird",
  Songbird: "bird",
  "Water bird": "bird",
}

/** True when the card's animal and the charity's animal are both known
 *  and different. */
function speciesClash(
  charityName: string | null,
  topicTitle: string,
  parentTopicTitle?: string | null
): boolean {
  if (!charityName) return false
  const charity = CHARITY_SPECIES[charityName.trim()]
  if (!charity) return false
  const topic =
    TOPIC_SPECIES[topicTitle.trim()] ??
    (parentTopicTitle ? TOPIC_SPECIES[parentTopicTitle.trim()] : undefined)
  return !!topic && topic !== charity
}

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

function findTopic(
  rows: TopicRow[],
  topicTitle: string,
  parentTopicTitle?: string | null
): TopicRow | null {
  const want = norm(topicTitle)
  const own = rows.find((r) => norm(r.topic) === want) ?? null
  if (own || !parentTopicTitle) return own
  // A subset that names an occasion never falls back: the parent's row
  // would carry it somewhere it does not belong.
  if (NEVER_INHERIT.has(topicTitle.trim())) return null
  // Every other subset inherits its parent's row (favpoll-topic-rules §1).
  const parent = norm(parentTopicTitle)
  return rows.find((r) => norm(r.topic) === parent) ?? null
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
    const hit = findTopic(
      occ.row.topics,
      input.topicTitle,
      input.parentTopicTitle
    )
    if (hit) {
      const occasion = occ.key.toLowerCase()
      e1 = hit.enacted
        ? {
            star: true,
            enacted: hit.enacted,
            text: `The guests' picks are enacted at ${article(occasion)} ${occasion}: ${hit.enacted}. The group needs no favourite of its own.`,
          }
        : hit.star
          ? {
              star: true,
              text: `A favourite ${topic} is part of ${article(occasion)} ${occasion}: ${occ.row.at}.`,
              ...(hit.outcome ? { outcome: hit.outcome } : {}),
            }
          : hit.why || occ.row.hop
            ? {
                star: false,
                text: `${article(occasion) === "an" ? "An" : "A"} ${occasion} suggests a favourite ${topic} only by a step the about must say out loud: ${hit.why ?? occ.row.hop}.`,
              }
            : {
                star: false,
                text: `A favourite ${topic} suits ${article(occasion)} ${occasion}; that needs no saying in the about.`,
              }
    }
  }

  // E2 — charity → topic. The charity's own confirmed topic beats its
  // row, and its row beats its family's.
  let e2: Edge | null = null
  // The charity's own subset matches the subset on the card; its topic
  // matches the topic on the card, or the parent behind a subset (a city
  // farm's Farm animal is Animal's corner: Animal is still its own).
  if (
    input.charityName &&
    input.charityTopic &&
    ((input.charityTopic.subsetTitle &&
      norm(input.charityTopic.subsetTitle) === norm(input.topicTitle)) ||
      norm(input.charityTopic.title) === norm(input.topicTitle) ||
      (input.parentTopicTitle &&
        norm(input.charityTopic.title) === norm(input.parentTopicTitle)))
  ) {
    e2 = {
      star: true,
      text: `A favourite ${topic} is ${input.charityName}'s own topic${input.charityTopic.reason ? `: ${input.charityTopic.reason.replace(/\.$/, "")}` : ""}.`,
    }
  } else if (input.charityName && input.causeFamily) {
    const family = FAMILY_ROWS[input.causeFamily]
    const rows = charityRow(input.charityName) ?? family.topics
    // A subset inherits its parent's charity row as it does the
    // occasion's (favpoll-topic-rules §1): Scottish island on RNLI's
    // Island, unless the row names the subset itself.
    const hit = findTopic(rows, input.topicTitle, input.parentTopicTitle)
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
    // A cats charity does not belong at a dog's memorial, whatever the
    // family row says (see CHARITY_SPECIES).
    const clash = speciesClash(
      input.charityName,
      input.topicTitle,
      input.parentTopicTitle
    )
    if (row && !clash) {
      e3 = {
        star: row.star,
        text: `${input.charityName} belongs at ${article(occ.key)} ${occ.key.toLowerCase()}: ${row.why}.`,
      }
    }
  }

  const count = [e1, e2, e3].filter(Boolean).length as 0 | 1 | 2 | 3
  return { e1, e2, e3, count }
}
