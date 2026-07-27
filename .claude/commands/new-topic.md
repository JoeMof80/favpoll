# /new-topic — scaffold a new favpoll topic

Scaffold a complete new topic entry in the **register-keyed placeholder model** used by favpoll today.

**Input:** a topic title as the argument, e.g. `/new-topic Cocktail` or `/new-topic Board game`.

---

## Before writing anything

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
  remembering: {
    pronouns: "she" | "he" | "they",
    about: "...",
    reveal: "...",
  },
  celebrating_one: {
    pronouns: "she" | "he" | "they",
    about: "...",
    reveal: "...",
  },
  celebrating_many: {
    pronouns: "they",
    about: "...",
    reveal: "...",
    group: "pair",    // "set" only for team-sport topics — default is always "pair"
  },
  cause: {
    pronouns: "she" | "he" | "they",
    about: "...",
    reveal: "...",
  },
  neutral: {
    pronouns: "she" | "he" | "they",
    about: "...",
    reveal: "...",
  },
},
```

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

**Canonical categories:** `"Nature"`, `"Music"`, `"Film & TV"`, `"Food & Drink"`,
`"Places"`, `"Sport"`, `"Literature"`, `"Everyday life"`, `"Childhood"`, `"Time"`

### 3. Topic items (→ `scripts/seed.ts`) — finite topics only

Insert into the `topicItems` array:

```ts
{
  topicTitle: "<Title>",
  items: [
    { label: "...", display_order: 1, markets: ["en-GB"] },
    { label: "...", display_order: 2, markets: ["en-GB"] },
    // 8–15 items total; use display_order only for finite topics
  ],
},
```

---

## Placeholder writing rules

### No named protagonists

Personas are written in third person with **no proper names**. The `pronouns` field is a
**label** describing the fixed prose — it does not re-conjugate text at runtime.

| pronouns | prose voice                              |
| -------- | ---------------------------------------- |
| `"she"`  | "A woman who…", "She…", "Her…"           |
| `"he"`   | "A man who…", "He…", "His…"              |
| `"they"` | "Someone who…", "A couple who…", "They…" |

**Balance genders within a topic.** `remembering` and `celebrating_one` tend to opposite
genders (if one is `"she"`, the other is `"he"`). `celebrating_many` always uses `"they"`.
`cause` and `neutral` may use any, though `"they"` fits most naturally.

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
- `celebrating_many` (`group: "pair"`): write from the couple's shared perspective
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
    pronouns: "she",
    about: "A woman who spent her working life in hotel bars and still judged any gathering by the quality of its drinks list. She had opinions about glassware, about ice, about the precise ratio of vermouth. She never ordered something she hadn't already decided on the way there.",
    reveal: "Hers was the Negroni. She made herself one every Friday evening for thirty years — the one ritual that belonged entirely to her.",
  },
  celebrating_one: {
    pronouns: "he",
    about: "A man who treats cocktails as a serious subject. He has the books, holds opinions about dilution, and has been known to send back a poor Martini without apology. He is particular about his order and quietly baffled by people who aren't.",
    reveal: "His is the Old Fashioned. He has ordered one at every new bar he has ever visited, as a kind of baseline test.",
  },
  celebrating_many: {
    pronouns: "they",
    about: "A couple who have been known to disagree about almost everything on a menu — except this. They have a standing order at their local and it hasn't shifted in years.",
    reveal: "Hers is the Aperol Spritz, and so is his — they both maintain it is strictly a summer drink, and they are correct.",
    group: "pair",
  },
  cause: {
    pronouns: "they",
    about: "A group that knows how to gather and how to mark a moment properly. Every event ends with the same round, and everyone arrives already knowing what's coming.",
    reveal: "Our pick to start: the Mojito — it has closed every fundraiser they have ever run.",
  },
  neutral: {
    pronouns: "she",
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

   The seed is additive and idempotent. It imports all six batch files at startup
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
- [ ] `celebrating_many` has `group: "pair"` (or `"set"` only for team-sport topics)
- [ ] `celebrating_many` uses `pronouns: "they"`
- [ ] No proper names in any `about` prose
- [ ] No charity references in any register
- [ ] Every `reveal` names an item present in the topic's `topic_items`
- [ ] `about` withholds the favourite; `reveal` discloses it
- [ ] No identical opening construction across all five `about` entries
- [ ] Genders balanced — `remembering` and `celebrating_one` tend to opposite genders
- [ ] `pnpm seed` completes without errors
- [ ] `node scripts/lint-topics.mjs` passes
- [ ] CI is green before merging
