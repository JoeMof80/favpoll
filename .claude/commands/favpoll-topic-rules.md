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
carries 16 occasion-specific placeholder pairs plus three generic fallbacks, and a list
of **items** (the answerable favourites). This skill defines what makes a topic and its
items good, so the library is broad and consistent enough that organisers and guests
almost never need to invent their own.

## 1. The three altitudes (the data model is the rule)

The schema has exactly three levels, and nothing lives between or below them:

- **Category** — one of the 10 fixed buckets (Nature, Music, Film & TV, Food & Drink,
  Places, Sport, Literature, Everyday life, Childhood, Time). New categories are rare and
  deliberate; a topic is tagged with one or two.
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

## 6. Occasion fit: register, not bans

Any topic can run on any occasion (each ships framing for all of them). Fit is about
_tone_ and _surfacing_, carried entirely by the placeholder copy. Every occasion has a
register; the copy must match it.

| Register                | Voice                                     | Occasions                                                                                                  |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Reflective / legacy** | Past tense, tender, eulogy-like           | memorial, tribute                                                                                          |
| **Celebratory**         | Present tense, warm, toast-like           | birthday, retirement, wedding, engagement, anniversary, leaving, graduation, achievement, award, promotion |
| **Forward-looking**     | Gentle, hopeful, a beginning              | christening, recovery                                                                                      |
| **Open (no persona)**   | Second-person invitation to the organiser | celebration, other, default                                                                                |

Surfacing follows register: lead the picker with universal topics (Colour, Song, Food,
Place, Animal) for every occasion; rank reflective-leaning topics (favourite saying, hymn,
walk) up for memorial/tribute and down for a child's birthday; rank child-centred topics
(storybook, sweet) up for christening. Down-rank, don't ban.

## 7. The personas (the engine of the copy)

Persona occasions are written as a specific recurring character. Reusing the same persona
across every topic is intentional — it is the "repetition with variance" that keeps quality
high: the persona is constant, the topic-specific detail varies.

- **memorial** — Belinda: retired teacher and mother, forty years of pupils and garden, a
  precise eye; Marie Curie nurses cared for her at home. (she/her, past tense)
- **tribute** — a mentor, colleague and friend; decades shaping careers; nothing by
  accident. (he/him, past tense)
- **birthday** — Sarah: turning 40, decisive, opinionated, hiker, strong tastes. (she/her)
- **retirement** — David: 35 years building engineering teams, steady, golfer, the Dales.
  (he/him)
- **wedding** — Emma & James: met at a rainy festival in 2019, amiably disagree about
  everything domestic. (they)
- **engagement** — Callum & Sophie: Lake District walkers; Callum proposed (Arthur's Seat,
  New Year / the fells above Coniston); Sophie thought it was just a walk. (they)
- **anniversary** — Mum & Dad: 40 years, three houses, gentle unresolved domestic
  disagreements. (they)
- **leaving** — Priya: six years in the studio, deliberate, brought the right thing,
  cycled in, grew up near the coast in Tamil Nadu. (she/her)
- **graduation** — Tom: architecture at Manchester, studio all-nighters, scale models,
  thinks on foot. (he/him)
- **christening** — Lily: born in March, on a Tuesday, already unimpressed; a family full
  of opinions. (she/her, infant, forward-looking)
- **achievement** — Marcus: ran his first marathon, raising for the RNLI **through favpoll
  itself**, trained eight months on the coastline the RNLI patrols. (he/him)
- **recovery** — Claire: finished treatment, one year of recovery, daily walks, music got
  her through. (she/her, gentle/forward-looking)
- **award** — Amelia: Teacher of the Year, English teacher, her classroom an institution.
  (she/her)
- **promotion** — Kwame: three years of excellent work, now Head of Product, grew up in
  Accra, has a theory about everything. (he/him)
- **celebration / other / default** — no persona. Second-person copy inviting the
  organiser to tell their own story and prompting for the favourite.

## 8. The writing discipline (every placeholder pair)

1. **Reveal first.** A specific named answer + one concrete, characteristic detail. The
   named answer **must be an item in this topic's list** (write the item list first).
2. **About second.** Set up the topic area through the persona **without naming the
   answer** the reveal will give.
3. **No leak.** Re-read: does the about give away the reveal's answer? If so, rewrite.
4. **Match the register** (section 6) — past tense for reflective, present for celebratory,
   gentle for forward-looking, second-person for the open three.
5. **Variance.** Across a topic's 16 cells, vary sentence shape and openings; don't let the
   structure become a visible template. (This is where seeded phrase-bank variance helps,
   on the generic occasions and on repeated closers.)

## 9. TopicSeed shape (current — for reference)

```ts
type TopicSeed = {
  title: string;
  description: string; // one short phrase: what this captures about a person
  is_finite: boolean; // closed list (true) vs starter list (false)
  categories: string[]; // 1–2 of the 10 fixed categories
  placeholders: {
    // about + reveal per occasion (NOT framing/quote)
    [occasion: string]: { about: string; reveal: string };
  };
};
```

Occasion keys (16 + 3 fallbacks): memorial, tribute, birthday, retirement, wedding,
engagement, anniversary, leaving, graduation, christening, achievement, recovery, award,
promotion, celebration, other, default. Finite topics also need a `topicItems` entry; an
optional `topicItemDisplayOrder` controls ordering, else alphabetical.

## 10. Audit checklist (for existing topics)

- Items all at one basic-level altitude (sibling test); flag mixed altitudes.
- No item is a grouping/superordinate or an expert-only subtype.
- Finite lists complete at basic level; infinite starter lists strong and tests-passing.
- `is_finite` correct for the topic's actual closed/open nature.
- Every reveal's named answer exists in `topicItems`.
- No about leaks its reveal.
- Each occasion's copy matches its register and persona.
- No two topics ship overlapping altitudes.
