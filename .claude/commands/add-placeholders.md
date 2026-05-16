Add or update placeholder content for one or more topics in `scripts/seed.ts`.

The argument is a topic title (or comma-separated list), e.g. `/add-placeholders Colour` or `/add-placeholders Colour, Season`.

## Rules

Each topic needs a `placeholders` object with exactly these 16 keys:
`memorial`, `tribute`, `birthday`, `retirement`, `wedding`, `anniversary`, `leaving`, `graduation`, `christening`, `achievement`, `recovery`, `award`, `promotion`, `celebration`, `other`, `default`

Each key maps to `{ framing: string; quote: string }`.

## Persona per occasion

Use these specific personas — they are established across the product and must stay consistent:

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
| promotion | Kwame Asante — 3 years going above and beyond, now Head of Product, always finds a way to make the impossible feel achievable |
| celebration | Generic/open — warm, inviting, no specific persona |
| other | Generic/open — warm, inviting, no specific persona |
| default | Generic fallback — no persona, open question |

## Pattern

**framing:** Connect the persona to the topic with a specific believable detail, then ask the guest for their own favourite.
- Format: "[Persona] loved/had/always [specific detail about their relationship to this topic] — which [topic] do you love?"
- The detail must be concrete and characteristic of that persona, not generic.

**quote:** A brief personal memory or observation about the persona's specific favourite. First person or observational. Ends with `…`
- Should feel like something a friend would say, not a caption.
- Must reference the specific thing the persona loves, not the topic in general.

## After writing

Edit the topic's `placeholders` block in `scripts/seed.ts`, then run `pnpm seed` to push the changes.
