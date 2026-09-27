# The Charity Commission register: the mirror, and mining it for perfect topics

## The mirror (`load-register.ts`, migration 20260927150000)

Every charity on the register, in our own database (`register_charities`),
refreshed from the Commission's bulk extract — knowledge, not a
relationship: a row there is never a consenting charity; the `charities`
table stays the account. Run from `apps/web`:

    pnpm exec tsx --env-file=.env.local ../../scripts/register/load-register.ts --download
    …same command again to refresh (it upserts); --dry-run to count only.

Search runs over `register_search_rows`, a narrow materialised copy of the
registered rows (migration 20260927170000); the loader refreshes it last.

Streams the four half-gigabyte extracts rather than parsing them whole;
main charities only, Registered and Removed both kept.

## Mining it for perfect topics (the pilot)

The pilot pipeline behind `references/perfect-topics-2026-09-26.md` (the
register section). Founder's intent, 2026-09-27: use every charity on the
register as inspiration for topics the catalogue lacks, and as the
approach list for onboarding ("we've set up Favourite river for you").

Data (not in the repo — ~1.2 GB unzipped) comes from the Commission's
bulk extracts, no API needed:

    https://ccewuksprdoneregsadata1.blob.core.windows.net/data/json/publicextract.charity.zip
    …/publicextract.charity_classification.zip
    …/publicextract.charity_governing_document.zip      (the charitable objects)
    …/publicextract.charity_area_of_operation.zip

Stages, each a small script run from `apps/web` with `pnpm tsx --env-file=.env.local`:

1. **Slice** — filter the register: registered, main charity, income and
   classification of interest. The pilot was Animals + Environment /
   conservation / heritage, income ≥ £500k: 2,115 charities.
2. **Label** (`label.ts`, Haiku) — the concrete thing at the centre of each
   charity's work ("rescued dogs and cats", "a canal network"), a kind, and
   whether it honestly has nothing a supporter would have a favourite of.
3. **Cluster** (`cluster.py`) — a quick look at the labels by kind.
4. **Propose** (`propose.ts`, Sonnet) — per kind, in chunks of 25 phrases,
   group the phrases into causes and name a topic per group: an existing
   catalogue topic when it honestly fits, else a new one with items and the
   rule it most risks failing. Resumable; four chunks in parallel.
5. **Consolidate** — group the proposals by topic: charities served, items,
   doubts, and the member list, which is the outreach list for that topic.

State of play: labels done for the pilot slice; proposals done for the
animals kind only (the API credit ran out); the other kinds resume with
`propose.ts` once credit is topped up. Paths inside the scripts point at
the session scratchpad and need parameterising before this becomes a
`pnpm` script.
