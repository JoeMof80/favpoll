Scaffold a complete new topic entry for `scripts/seed.ts`, including all placeholder pairs for all 15 occasions.

The argument is the topic title, e.g. `/new-topic Cocktail` or `/new-topic Board game`.

## What to produce

A complete `TopicSeed` object ready to paste into the `topics` array in `scripts/seed.ts`:

```ts
{
  title: "...",
  description: "...",   // one short phrase: what this topic captures about a person
  is_finite: true,      // true if the answer set is fixed and enumerable; false if open-ended
  categories: [...],    // pick from: "Nature", "Music", "Film & TV", "Food & Drink", "Places", "Sport", "Literature", "Everyday life", "Childhood", "Time"
  placeholders: {
    memorial:    { framing: "...", quote: "..." },
    tribute:     { framing: "...", quote: "..." },
    birthday:    { framing: "...", quote: "..." },
    retirement:  { framing: "...", quote: "..." },
    wedding:     { framing: "...", quote: "..." },
    anniversary: { framing: "...", quote: "..." },
    leaving:     { framing: "...", quote: "..." },
    graduation:  { framing: "...", quote: "..." },
    christening: { framing: "...", quote: "..." },
    achievement: { framing: "...", quote: "..." },
    recovery:    { framing: "...", quote: "..." },
    award:       { framing: "...", quote: "..." },
    promotion:   { framing: "...", quote: "..." },
    celebration: { framing: "...", quote: "..." },
    other:       { framing: "...", quote: "..." },
    default:     { framing: "...", quote: "..." },
  },
}
```

If `is_finite: true`, also produce a matching entry for `topicItems` with a sensible set of options (8–15 items).

## Persona per occasion

| Occasion | Persona |
|---|---|
| memorial | Belinda Johnson — beloved mother, teacher, friend; gardener, tea drinker, Radio 4 |
| tribute | David Osei — mentor to dozens, jazz lover, always knew what to say |
| birthday | Sarah Mitchell — turning 40, cheese lover, hiker, meticulous city-break planner |
| retirement | David Clarke — 35 years in engineering, golfer, kept a photo of the Dordogne on his desk |
| wedding | Emma & James — met at a rainy festival 2019, strong coffee, ongoing argument about the best pizza in Naples |
| anniversary | Mum & Dad — 40 years together, same cup of tea every morning, good biscuits in the tin |
| leaving | Priya Sharma — starting her own studio after 6 years, leaves trail of good work and better jokes |
| graduation | Tom Ellis — architecture at Manchester, first class honours, zero sleep, excellent scale models |
| christening | Lily Rose — born on a Tuesday in March, already looking unimpressed |
| achievement | Marcus Webb — ran his first marathon, raised £4,000 for the RNLI, trained 8 months mostly in the dark, mostly in the rain |
| recovery | Claire Hennessy — completed treatment, one year recovery, says music got her through |
| award | Dr. Amelia Grant — Teacher of the Year, turns her classroom into the most inspiring place in the county |
| promotion | Kwame Asante — 3 years going above and beyond, now Head of Product |
| celebration | Generic/open — warm, inviting |
| other | Generic/open — warm, inviting |
| default | Generic fallback — no persona |

## Placeholder pattern

**framing:** Connect the persona to the topic with a specific believable detail, then invite the guest to share their own.
- Format: "[Persona] loved/had/always [specific detail] — which [topic] do you love?"
- The detail must be concrete and characteristic of the persona, not generic.

**quote:** A brief personal memory or observation about the persona's specific favourite. Observational, warm, ends with `…`

## After producing the scaffold

1. Insert the new topic object into the `topics` array in `scripts/seed.ts` (in the appropriate finite/infinite section).
2. If finite, insert the items into `topicItems`.
3. Run `pnpm seed` to push to the database.
