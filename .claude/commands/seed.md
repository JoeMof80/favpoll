Run the favpoll seed script to push any topic/placeholder/charity/category changes to the Supabase database.

1. Check whether `scripts/seed.ts` has been modified (via `git status` or `git diff`). If it has, briefly summarise what changed (new topics, updated placeholders, etc.).
2. Run `pnpm seed` and report the output.
3. If any inserts or updates are 0 when changes were expected, flag the likely cause (e.g. title mismatch, missing column).

---

## Canonicality — what belongs in the seed

The seed is favpoll's editorial voice: every topic and favourite in it is
"canonical" (`favourites.is_canonical`) and feeds the record. The glossary
(`references/GLOSSARY.md`) defines the machinery; this section defines the
editorial bar.

### Finite vs infinite decides what "exhaustive" means

- **Finite topics** (`is_finite: true`) are *complete enumerations* — nobody
  can add to them, ever. Their lists must be closed sets with a defensible
  boundary: Colour is the **11 basic English colour terms**, Month is 12,
  Day of the week is 7, National park is **all 15 UK parks**. A short finite
  list is usually deliberate — check the boundary before "filling it in".
  Never make a topic finite unless the boundary is genuinely closed.
- **Infinite topics** (`is_finite: false`) carry a *canonical seed list* that
  organisers pin and guests extend; non-canonical favourites join the canon
  by **inclusion** (3 independent favpolls). The seed list's job is coverage
  of the *plausible answer space*: a guest's honest favourite should usually
  already be on the list. Aim for **25–40 items**; under ~20 is a smell
  unless the domain is genuinely narrow (e.g. Puzzle).

### Topic admission bar

A new topic earns its place when it is ALL of:

1. **Sentimentally load-bearing** — a favourite here says something about a
   *person* ("she was a Whitby woman"), not just a preference. The test:
   would it be at home in a eulogy or a best-man speech?
2. **Register-safe** — it must work at a memorial AND a birthday. (Topics
   can *lean* — Hymn and Poem lean remembering; Nursery rhyme leans
   new-baby — but must not be absurd in the other registers.)
3. **UK-first** — the canon is British sentimentality (Biscuit, Seaside
   town, Roast dinner); global entries earn their place by UK resonance.
4. **Answerable from memory** — a guest at a wake with a phone in one hand
   must produce their answer in seconds. No research topics.
5. **Not a subset that steals an existing topic's traffic** — a subset is
   justified only when it has its own emotional register (Christmas film vs
   Film; Sitcom vs TV show; Carol vs Song). If the parent topic serves the
   same moment, don't split.

### Favourites list bar (infinite topics)

- Every item must be a **plausible real person's favourite**, named the way
  people actually say it ("Jaffa Cake", not "McVitie's Jaffa Cakes").
- **Span the generations** — the guest list at a funeral runs 8 to 88. Car
  needs the Ford Fiesta and the Bugatti Veyron as much as the Morris Minor.
- **Everyday beats exotic** — the most-owned, most-sung, most-eaten entries
  are the most-picked. Icons earn their slots; obscurities don't.
- Lists are **alphabetical** (case-insensitive), double-quoted, no trailing
  descriptors.
- Brand safety: no items that would be uncomfortable on a memorial display.

### Placeholder copy bar

Register-keyed copy lives in `scripts/placeholders-regenerated-*.ts` (one
object per batch; `combinedPlaceholders` is authoritative at write time — the
inline `placeholders` on topic rows are a legacy fallback, keep them to the
minimal celebration/other/default shape). Follow the discipline block in
`seed.ts`: write the reveal first (named answer + ONE concrete detail),
then the about (must not leak the answer). Personas must vary — no
mechanical rotation across registers. Reveal grammar by register:
"Hers/His was X." (remembering) · "Hers/His is X." (celebrating_one) ·
"Hers is X, his is Y." (celebrating_many, defaults to a pair) ·
"Our pick to start: X — …" (cause; charity-free) · "Theirs is X."
(neutral). Every named answer must exist in the topic's item list —
`node scripts/lint-topics.mjs` enforces this for seed.ts and should be run
after any placeholder or list change. Named-figure/IP reveals describe the
persona's relationship to the work, never fabricated claims about real
people.
