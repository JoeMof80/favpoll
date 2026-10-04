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

## The removal check (`check-removals.ts`, migration 20261004140000)

REMOVAL IS NOT STALENESS (`references/charity-profiles-2026-09-27.md` §3).
Staleness is compared on the derived fields and regenerated lazily; a
charity that has LEFT the register is wrong, not old, and money moving to
a deregistered charity is the one failure here with real consequences. So
every load ends with this check, and it also runs on its own against the
mirror already in the database:

    pnpm exec tsx --env-file=.env.local ../../scripts/register/check-removals.ts

It reads `register_account_removals()` — the standing of every ACCOUNT
charity (`charities`) against the mirror, with the money pointing at each
(favpolls, the equal split of what they raised, payouts still pending,
Gift Aid declarations). Three verdicts: **removed** (deregistered — loud,
and `setCharityConsent` refuses to approve it), **gone** (absent from the
latest extract: a deregistration with no removal date, or a load that
stopped half way — warns only), **unknown** (no mirror row: registered
since the extract, a linked number, or a typo — quiet). The loader prints
the report and never fails a good load over it; run alone it exits 1 when
something needs a human, so a cron can scream.

The same list is the first thing on admin `/charities`. To see it with
something in it, point a throwaway account at a removed number:

    insert into charities (name, registered_number, is_active)
    select 'ZZ probe (delete me)', registered_number::text, false
    from register_charities
    where status <> 'Registered' and removed_on is not null limit 1;
    -- delete from charities where name = 'ZZ probe (delete me)';

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
