# /new-topic — scaffold a new favpoll topic

Scaffold a complete new topic entry in the **register-keyed placeholder model** used by favpoll today.

**Input:** a topic title as the argument, e.g. `/new-topic Cocktail` or `/new-topic Board game`.

---

## Before writing anything

**Overlap gate — check this first.** `favpoll-topic-rules` forbids shipping
overlapping altitudes: never run both a topic and a narrower slice of it
(`Animal` + `Farm animal`, `Bird` + `Bird of prey`). If you cannot state the
different question in one sentence — as `Sport to play` vs `Sport to watch` does
— it is one topic, not two. Stop and pick one.

Read the source files to understand current shapes exactly — do not guess:

```bash
# Understand the batch file export shape
head -80 $(ls scripts/placeholders-regenerated*.ts | head -1)

# Understand TopicSeed type and the topics / topicItems arrays
grep -n "title:\|is_finite:\|TopicSeed\|topicItems" scripts/seed.ts | head -40

# Understand the lint guard — what format does reveal need to match?
cat scripts/lint-topics.mjs

# Check if apply-placeholders.ts exists
ls scripts/apply-placeholders.ts 2>/dev/null && echo "exists" || echo "absent"

# Check batch file sizes to find the least-populated one
wc -l scripts/placeholders-regenerated*.ts
```

---

## What to produce

### 1. Placeholder entry (→ batch file)

Add one new entry to the exported object in the **least-populated**
`scripts/placeholders-regenerated*.ts` batch file. Key it by the exact topic title:

```ts
"<Title>": {
  remembering: { about: "...", reveal: "..." },
  celebrating_one: { about: "...", reveal: "..." },
  celebrating_many: { about: "...", reveal: "..." },
  cause: { about: "...", reveal: "..." },
  neutral: { about: "...", reveal: "..." },
},
```

**Entries carry `about` and `reveal` ONLY.** The batch type is
`Record<Register, { about: string; reveal: string }>` — there is no `pronouns`
field and no `group` field. `group` moved to `scripts/celebrating-many-groups.ts`,
which holds the `"set"` overrides; everything else defaults to `"pair"`.

Gender still matters in the PROSE (see below) — it is simply not a field.

### 2. Topic row (→ `scripts/seed.ts`)

Insert into the `topics` array in the appropriate finite / infinite section:

```ts
{
  title: "<Title>",
  description: "...",   // one short phrase — what this topic reveals about a person
  is_finite: true | false,
  categories: [...],    // pick from the canonical list below
},
```

**Canonical categories (11, as seeded — verify against seed.ts before using):**
`"Animals"`, `"Books & Arts"`, `"Childhood"`, `"Everyday life"`, `"Film & TV"`,
`"Food & Drink"`, `"Music"`, `"Nature"`, `"Places"`, `"Sport"`, `"Time"`

Note `"Animals"` and `"Books & Arts"` are live; there is no `"Literature"`.

### 3. Topic items (→ `scripts/seed.ts`) — every topic

Insert into the `topicItems` object — it is
`Record<string, string[]>`, a title keyed to a flat array of label strings:

```ts
"<Title>": [
  "First item",
  "Second item",
  // alphabetical unless a natural order exists
],
```

Ordering is alphabetical by default. For a topic with a natural order (months,
days, planets), add a separate entry to `topicItemDisplayOrder`:

```ts
"<Title>": { "First item": 1, "Second item": 2 },
```

**Infinite topics get items too** — a strong curated starter set that guests
extend. Items are not finite-only.

---

## Placeholder writing rules

### No named protagonists

Personas are written in third person with **no proper names**. Gender lives in the
prose alone — there is no `pronouns` field to set (see the entry shape above).

| gender in the prose | how it reads                             |
| ------------------- | ---------------------------------------- |
| she                 | "A woman who…", "She…", "Her…"           |
| he                  | "A man who…", "He…", "His…"              |
| they                | "Someone who…", "A couple who…", "They…" |

**Balance genders within a topic.** `remembering` and `celebrating_one` take opposite
genders. `celebrating_many` is always a couple or group ("they"). `cause` and `neutral`
may use any, though "they" fits most naturally — and `cause` is faceless, so it takes
the instruction form ("Pick the one you'd… and pledge what it's worth.") with the reveal
opening "Our pick to start: …".

---

### `about` — the pre-reveal hook

A persona portrait that teases the topic domain but **withholds the specific favourite**.

Rules:

- Describes the persona's _relationship_ to the topic domain: their expertise, ritual,
  obsession, aesthetic sensibility, or history with it.
- Creates genuine intrigue — the reader wonders _which one_.
- **Never names the actual favourite.** The favourite lives only in `reveal`.
- Charity-free. No rhetorical question ("What's your favourite…?"). No framing device.
- 2–4 sentences. Concrete sensory detail is better than generic enthusiasm.
- **Do not rotate the same opening construction across all five registers.** Each `about`
  should find a distinct angle on the persona's relationship to the topic.

---

### `reveal` — the answer

One sentence naming a **real item from the topic's `topic_items` list**.

Rules:

- The item label must **case-insensitively match** a label in `topic_items`. This is
  enforced at build time by `scripts/lint-topics.mjs` — if the item is absent, the
  build fails.
- Named real people and branded IP are allowed (e.g. "She has watched _Casablanca_
  every New Year's Eve since 1987.") — describe the persona's _relationship_ to the
  item; **never fabricate quotes**.
- One sentence. One concrete detail. Not a list, not generic praise.
- `celebrating_many`: write from the couple's shared perspective
  ("They argue about it every time; they always end up ordering the same thing.").

---

### Copy quality bar

- Each of the five registers should read **distinctly** — the persona's relationship to
  the topic shifts across occasion type. No mechanical rotation of the same phrasing.
- `about` should make the reader want to know the answer.
- `reveal` should feel like a satisfying disclosure: one specific, vivid detail.
- Charity-free throughout all five registers.

---

### Worked example — `"Cocktail"` (illustrative; not to be seeded)

```ts
"Cocktail": {
  remembering: {
    about: "A woman who spent her working life in hotel bars and still judged any gathering by the quality of its drinks list. She had opinions about glassware, about ice, about the precise ratio of vermouth. She never ordered something she hadn't already decided on the way there.",
    reveal: "Hers was the Negroni. She made herself one every Friday evening for thirty years — the one ritual that belonged entirely to her.",
  },
  celebrating_one: {
    about: "A man who treats cocktails as a serious subject. He has the books, holds opinions about dilution, and has been known to send back a poor Martini without apology. He is particular about his order and quietly baffled by people who aren't.",
    reveal: "His is the Old Fashioned. He has ordered one at every new bar he has ever visited, as a kind of baseline test.",
  },
  celebrating_many: {
    about: "A couple who have been known to disagree about almost everything on a menu — except this. They have a standing order at their local and it hasn't shifted in years.",
    reveal: "Hers is the Aperol Spritz, and so is his — they both maintain it is strictly a summer drink, and they are correct.",
  },
  cause: {
    about: "A group that knows how to gather and how to mark a moment properly. Every event ends with the same round, and everyone arrives already knowing what's coming.",
    reveal: "Our pick to start: the Mojito — it has closed every fundraiser they have ever run.",
  },
  neutral: {
    about: "Someone with a clear favourite — consistent, unhurried, and mildly impatient with menus that bury the classics. She hasn't wavered in years and doesn't intend to.",
    reveal: "Hers is the Daiquiri. She has ordered one at every occasion that called for a drink, and a fair number that didn't.",
  },
},
```

---

## How to apply

1. **Add the placeholder entry** to the least-populated `scripts/placeholders-regenerated*.ts`
   batch file (append to its exported object, maintaining consistent formatting).

2. **Add the topic row** to the `topics` array in `scripts/seed.ts` in the appropriate
   finite / infinite section.

3. **Add items** (finite topics only) to the `topicItems` array in `scripts/seed.ts`.

4. **Merge placeholders** — if `scripts/apply-placeholders.ts` exists, run it:

   ```bash
   pnpm tsx scripts/apply-placeholders.ts
   ```

5. **Reseed** from the repo root:

   ```bash
   pnpm seed
   ```

   The seed is additive and idempotent. It imports all EIGHT batch files at startup
   (duplicate title → throws), creates the topic row, runs `applyAllPlaceholders()`
   (writes placeholders to DB by title), and `assertAllTopicsHavePlaceholders()` (verifies
   all 5 register keys are non-empty for every active topic). Fix any assertion errors
   before continuing.

6. **Verify lint:**

   ```bash
   node scripts/lint-topics.mjs
   ```

   Every `reveal` must name an item present in that topic's `topic_items`. Fix any
   mismatches before committing.

7. **Branch, PR, 2 green CI checks** — never push directly to `main`.

---

## Pre-commit checklist

- [ ] Exactly 5 register keys in the placeholder entry (`remembering`, `celebrating_one`,
      `celebrating_many`, `cause`, `neutral`)
- [ ] `celebrating_many` prose reads as a couple ("A pair who…", "They…"); a GROUP
      persona means adding the topic to `scripts/celebrating-many-groups.ts` instead
- [ ] No proper names in any `about` prose
- [ ] No charity references in any register
- [ ] Every `reveal` names an item present in the topic's `topic_items`
- [ ] `about` withholds the favourite; `reveal` discloses it
- [ ] No identical opening construction across all five `about` entries
- [ ] Genders balanced — `remembering` and `celebrating_one` tend to opposite genders
- [ ] `pnpm seed` completes without errors
- [ ] `node scripts/lint-topics.mjs` passes
- [ ] CI is green before merging
