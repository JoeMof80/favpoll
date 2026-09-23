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

There is no altitude beneath item. This is what resolves "too specific vs too general":

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
prey"; pick one, and reserve a narrower variant only for an occasion that specifically
pulls for it.

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
- No two topics ship overlapping altitudes.
