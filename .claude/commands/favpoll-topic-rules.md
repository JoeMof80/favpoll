---
name: favpoll-topic-rules
description: >
  The quality standard for favpoll topics. Use this whenever creating a new topic,
  auditing or fixing an existing one, deciding whether something belongs as a category,
  topic, or item, or judging whether an item is too specific or too general. The
  new-topic generator and any topic audit both obey this skill. It does not write
  copy itself — it defines what good looks like.
---

# favpoll topic rules

A **topic** is the subject of a favpoll (favourite Colour, Song, Biscuit). Each topic
carries **five register-keyed placeholder pairs** and a list of **items** (the answerable
favourites). This skill defines what makes a topic and its items good, so the library is
broad and consistent enough that organisers and guests almost never need to invent their
own.

## 1. The three altitudes (the data model is the rule)

The schema has exactly three levels, and nothing lives between or below them:

- **Category** — one of the 11 fixed buckets (Animals, Books & Arts, Childhood,
  Everyday life, Film & TV, Food & Drink, Music, Nature, Places, Sport, Time). New
  categories are rare and deliberate; a topic is tagged with one or two.
- **Topic** — the question (Bird, Song, Colour). Sits one step below its category.
- **Item** — the answer (Robin, Jerusalem, Purple). Sits one step below its topic, at the
  **basic level**: the word an ordinary person reaches for first when pointing at one.

There is no altitude beneath item. There is one thing **beside** a topic, which is not an
altitude:

- **Subset** — a named subset of ONE topic's items, for a cause or an occasion that pulls
  for it (founder, 2026-09-27; first called a lens, renamed the same evening: "it's a
  subset of a topic, right?"). `Farm animal` is a subset of Animal (Cow, Pig, Sheep,
  Goat, Chicken, Donkey…); `Cathedral` is a subset of Landmark or building. The Charity
  Commission register kept proposing subsets as topics (Pet, Farm animal, Zoo animal,
  Safari animal, Big cat), which is how the idea arrived: the cause needs its corner of
  the shelf, not a new shelf. The founder's rulings (2026-09-27, evening):

  1. **Its own object.** A subset is a row of its own — parent topic, name, item subset —
     shared by everyone who points at it. Two city farms share one Farm animal. It is
     shelf vocabulary; the charity that prompted it is not special (a charity's perfect
     topic may simply be a subset instead of a topic).
  2. **Admin-made, picker-visible.** Admins create subsets: from a scan of the catalogue
     up front, from the suggester's proposals, or by promoting an organiser's homemade
     topic. Organisers never create one, but any organiser can pick one.
  3. **Flat in the picker, with a marker.** A subset is a row in the same list as its
     parent, under the same search and category filters, marked "of Animal". Browsing
     shows the parent then its subsets; searching "farm" finds Farm animal. No nesting.
  4. **Its name everywhere; its own record, fed from above.** Hero, card, share text,
     live display, guest book all say "Favourite farm animal". The favpoll stores the
     parent as its topic and the subset as a pointer beside it. On the RECORD (founder,
     2026-09-28, revising the first ruling that picks "roll up into the parent"): a pick
     says only "this beats everything on the list I was shown". So a parent's record
     counts only picks from favpolls that showed the whole list; a subset's record
     counts picks from its own favpolls PLUS picks of its members from the parent's
     whole-list favpolls (your favourite animal is your favourite farm animal if it is
     one). Picks flow down from parent to every subset the item belongs to, never up —
     a city farm's favpolls must not push Cow up a ranking its guests never voted in.
     Subset picks are kept in their own scoped totals (subset × favourite); the
     favourite row's all-time totals stay the whole-list record.
  5. **Inherits the parent's openness.** A subset narrows only the STARTERS. On a finite
     parent the list is closed to the subset's items; on an open parent guests may still
     add their own (Alpaca on Farm animal rolls into Animal). A subset has **no items of
     its own, no placeholder copy of its own, and no rules of its own**.
  6. **Stored as a join, referenced as parent-plus-pointer.** `topic_subsets` (parent,
     title, slug) and `topic_subset_items` → the parent's favourites rows, so a subset can
     never name an item the parent lacks. Favpolls, charities (perfect topic) and pairing-
     table occasion rows keep the parent as the topic and add a nullable subset pointer
     that must belong to that topic; a check enforces it.
  7. **What qualifies: the topic test, one altitude sideways.** A phrase an ordinary
     person puts after "favourite" without thinking (farm animal, pet, big cat, garden
     bird, Sunday roast) — never a textbook grouping or a cut by letter or decade. At
     least six items ALREADY on the parent's list, at most sixteen. Subsets of one parent
     may overlap (Pet and Farm animal both hold Goat) but one may not contain another
     whole. Names follow topic grammar: singular, basic level, reads after "Favourite".
  8. **Promotion creates, never re-homes.** When an admin turns a homemade topic into a
     subset, the favpoll that made it keeps its homemade topic and items (a live favpoll's
     meaning is never changed after the fact); the homemade row is delisted from the
     picker so the next organiser finds the subset. Promotion to a canonical TOPIC is
     different and in place: the homemade row is itself curated, so its favpoll rides
     along.

  Build order (2026-09-27): schema + these rules → the scan and its admin approval → the
  picker row, creation narrowing starters (finite parents too), the name on every surface,
  the Story engine given the name, the scoped totals and the subset's record → charities (perfect subset pointer; the suggester
  matches to existing subsets; the per-charity `perfect_topic_items` list retires) →
  occasions and the seed → promotion. Stop after the picker step and look at it on the
  phone. Until the schema lands, the first step still stands: a charity's perfect topic
  carries an optional item list (`perfect_topic_items`). This is what resolves "too
  specific vs too general":

- In **Bird**, `Falcon` is a correct item. `Peregrine falcon` is **too specific** — it is
  a _kind of_ falcon, and only an enthusiast names it. It has nowhere to live, by design.
- `Bird of prey` is **too general** — a textbook grouping. Not a category (those are
  fixed), too broad for an item, too niche as a topic. It also has nowhere to live.
- Narrowing the topic does **not** lower item altitude. "Birds of prey" as a topic would
  just restrict the same basic-level shelf to eagle/hawk/falcon/owl — still not peregrine.
  Keep narrowing and the _topic_ eventually fails the favourite test (only a falconer has
  a favourite falcon), so there is a natural floor.

## 2. The item tests (an item must pass all three)

1. **Sibling test (no nesting).** No item is a _kind of_ another item in the same list.
   If "an X is a kind of Y" is true of two entries, you have mixed altitudes — keep one.
2. **Name-it test (accessibility).** Ask a layperson to "name some [topic]". If it
   wouldn't surface without expertise, it's too specific. If it _is_ the topic or a
   grouping, it's too general.
3. **Favourite test (discrimination).** Different guests would plausibly pick different
   ones, and someone would say "my favourite is X". No one's favourite is "bird"; almost
   no one's reachable favourite is "peregrine falcon".

## 3. Exhaustive means complete at the basic level — not taxonomically

An item list is "exhaustive" when it covers the answers ~all guests would actually give at
the basic level (aim for ~90%), plus the _Other / something else_ escape hatch and (for
infinite topics) guest-added items as the backstop. Do **not** chase the long tail.
Worked example — **Colour**: the ~11 English basic colour terms + a few common extras
(teal, navy) + Other. `Cerulean` is too specific; `warm colours` too general.

## 4. Finite vs infinite (maps to `is_finite`)

Every topic ships an item list. The flag decides whether it is closed or extensible:

- **`is_finite: true` — closed list.** The basic-level set is small and fixed
  (≤ ~25 recognisable items). List the whole set; guests pick only from it. Examples:
  Colour, Season, Day of the week, Decade, Meal of the day, Time of day. Canonical sets
  (zodiac, Disney Princesses, the Beatles) are finite too — list all of them.
- **`is_finite: false` — starter list.** The space is open-ended (Film, Song, Place).
  Ship a strong curated starter set at the basic level; guests extend it via the
  _Other_ path. The starter set still obeys all the item tests.

Heuristic: if enumerating at the basic level balloons or forces you up to expert grain,
it's infinite.

## 5. Topic scoping (the real craft call)

Pick the scoping where "people who'd have a favourite here" is densest. "Garden birds"
(robin, blackbird, blue tit, wren) beats both "Birds" (sprawls to ostriches) and "Birds of
prey" (niche). **Never ship overlapping altitudes** — don't run both "Birds" and "Birds of
prey"; pick one. A narrower slice that a cause or an occasion pulls for is a **subset** of
the topic (section 1), never a second topic. The test: if every item of the proposed topic
already sits in an existing topic's list, it is a subset.

## 6. The five registers (what the copy is keyed to)

Any topic can run on any occasion — fit is about _tone_, carried entirely by the
placeholder copy. But the copy is **not** written per occasion. Thirty-six occasion types
collapse into **five registers**, and a topic ships one `about` + `reveal` pair per
register. The mapping lives in `OCCASION_TO_REGISTER` in `scripts/seed.ts`.

| Register           | Voice                                    | Occasions that map to it                                                                      |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| `remembering`      | Past tense, tender, eulogy-like          | Memorial, Tribute, Celebration of life, Pet memorial, In memoriam appeal                       |
| `celebrating_one`  | Present tense, warm, toast-like          | Birthday, Retirement, Graduation, Christening, Recovery, Promotion, Award, New home, …         |
| `celebrating_many` | Present tense, a couple or a group       | Wedding, Engagement, Anniversary, Renewal of vows, Reunion, Team celebration, Family gathering |
| `cause`            | **Faceless** — second-person instruction | Fundraiser, Sponsored event, Charity night                                                     |
| `neutral`          | Present tense, no occasion assumed       | everything else (`default`)                                                                    |

`celebrating_many` defaults to a **pair**. Topics whose group persona should be a team or
club instead are listed in `scripts/celebrating-many-groups.ts` and tagged `"set"`.

Surfacing follows register: lead the picker with universal topics (Colour, Song, Food,
Place, Animal) for every occasion; rank reflective-leaning topics (favourite saying, hymn,
walk) up for memorial/tribute and down for a child's birthday; rank child-centred topics
(storybook, sweet) up for christening. Down-rank, don't ban.

## 7. Personas: unnamed, and gendered only in the prose

The named recurring personas (Belinda, Sarah, David, Marcus…) are **retired** along with
the 16-occasion model. Register copy carries **no proper names at all** — the persona is a
sketch in third person, and the occasion is implied by the register.

| Register           | How it reads                                                  |
| ------------------ | ------------------------------------------------------------- |
| `remembering`      | "She kept a telescope by the back door…" — past tense         |
| `celebrating_one`  | "He had the poster on the ceiling…" — present tense           |
| `celebrating_many` | "A couple who…", "A pair who…" — shared perspective           |
| `cause`            | "Pick the one you'd visit first and pledge what it's worth."  |
| `neutral`          | "Most people settled this aged seven and never revisited it." |

**Balance genders within a topic:** `remembering` and `celebrating_one` take opposite
genders. `celebrating_many` is a couple or group. `cause` and `neutral` may use any.

**`cause` has a fixed shape.** It is faceless — there is no persona to describe — so the
`about` is an instruction to the reader and the `reveal` opens "Our pick to start: …".

## 8. The writing discipline (every placeholder pair)

1. **Reveal first.** A specific named answer + one concrete, characteristic detail. The
   named answer **must be an item in this topic's list** (write the item list first).
2. **About second.** Set up the topic area through the persona **without naming the
   answer** the reveal will give.
3. **No leak.** Re-read: does the about give away the reveal's answer? If so, rewrite.
4. **Match the register** (section 6) — past tense for `remembering`, present for the
   celebrating pair, second-person instruction for `cause`.
5. **Variance.** Across a topic's five registers, vary sentence shape and openings; don't
   let the structure become a visible template.
6. **Charity-free.** No register mentions charity — that is the page's job, not the
   placeholder's.

## 9. Where the copy actually lives

Two places, and they are not the same thing.

**The real copy — batch files.** `scripts/placeholders-regenerated*.ts` (eight of them)
hold the five register pairs per topic. This is what `seed.ts` writes to the DB, so it is
the copy guests see. Entries carry `about` and `reveal` only — no `pronouns` field, no
`group` field.

```ts
"<Title>": {
  remembering: { about: "...", reveal: "..." },
  celebrating_one: { about: "...", reveal: "..." },
  celebrating_many: { about: "...", reveal: "..." },
  cause: { about: "...", reveal: "..." },
  neutral: { about: "...", reveal: "..." },
},
```

**The topic row — `scripts/seed.ts`.** Its inline `placeholders` use the three OPEN
occasion keys (`celebration`, `other`, `default`) and hold generic second-person
instructions. They are overwritten in the DB by the batch copy and are skipped by the
linter, so they are effectively scaffolding.

```ts
type TopicSeed = {
  title: string;
  description: string; // one short phrase: what this captures about a person
  is_finite: boolean; // closed list (true) vs starter list (false)
  categories: string[]; // 1–2 of the 11 fixed categories
  placeholders: RawTopicPlaceholders | TopicPlaceholders;
};
```

**Items.** `topicItems` is `Record<string, string[]>` — a title keyed to a flat array of
labels. **Every topic ships items**, not only finite ones; infinite topics get a starter
set that guests extend. Alphabetical unless a natural order exists, in which case add an
entry to `topicItemDisplayOrder`.

**The guard.** `node scripts/lint-topics.mjs` checks that every reveal names an item in
that topic's list. It reads the INLINE placeholders in seed.ts, **not** the batch files —
so batch reveals must be verified by hand, or by seeding and querying the result.

## 10. Audit checklist (for existing topics)

- Items all at one basic-level altitude (sibling test); flag mixed altitudes.
- No item is a grouping/superordinate or an expert-only subtype.
- Finite lists complete at basic level; infinite starter lists strong and tests-passing.
- `is_finite` correct for the topic's actual closed/open nature.
- Every reveal's named answer exists in `topicItems`.
- No about leaks its reveal.
- All five registers present, each matching its voice (sections 6–7).
- `cause` uses the faceless instruction form.
- No proper names anywhere in the placeholder prose.
- No two topics ship overlapping altitudes; a slice of an existing topic is a subset.
