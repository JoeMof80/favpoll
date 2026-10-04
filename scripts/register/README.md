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

## The profile floor (`charity_profiles`, migration 20261004160000)

Layer two of the charity model (`references/charity-profiles-2026-09-27.md`):
what WE derived about a charity that has agreed to nothing. Keyed by
registered number as TEXT, so a hand-written Scottish or Northern Irish
profile has a key at all.

After a load, give the new charities their floor — one statement in the SQL
editor, because it takes ~11s against an 8s API statement timeout:

    select refresh_charity_profiles();

It inserts a profile for every Registered charity that has none and
refreshes the ones that are still only a floor; a drafted, reviewed or
superseded profile is never touched, because its FINGERPRINTS are the
record of what it was derived from. On dev: 171,909 profiles, 20s for the
backfill, 11s for a pass that changes nothing.

**The floor is a topic FAMILY and never a topic** (decision 1):
`charity_topic_family()` maps five subject codes to a catalogue category —
Animals, Nature, Sport, Books & Arts, Music — and says nothing otherwise,
including when a MISSION code (health, disability, poverty, overseas aid,
housing) makes a subject code incidental. Measured on the 59 account
charities with a confirmed cause family: with the guard it speaks for 11
and is right 11 times; without it, it also offered the RNLI a favourite
poem, FareShare a favourite river and RNIB a favourite football team.
Coverage is 36% of the register (61,339 of 171,909), and the other 64% is
honest silence — the model still runs.

**Staleness is never the date** (decision 3): `charity_profiles_stale`
compares the four fingerprints (name, objects, activities, classification)
against the mirror's current text, so it catches a change WITHIN one
extract date — which `extract_date` cannot, since income and year-end move
for all 172k every quarter.

## An outreach wave (step 2)

A wave spends model money on register charities nobody has ever contacted,
so the first question is who is worth spending it on.
`charity_outreach_candidates(income_floor, limit)` answers it with four
`where` clauses on tables we already hold — Registered, has a website, has
a classification the rule floor maps, income above a floor — and excludes
anyone who already has an account (that is the consent queue's business,
not a wave's). Measured on dev:

| | charities |
|---|---|
| Registered | 171,909 |
| + has a website | 103,392 |
| + a classification the floor maps | 40,255 |
| + income >= £100,000 | 12,904 |

93% of the register is gone before a single call. That is decision 4's
point: the filter is the lever, not the model price. £25k leaves 22,341 and
£500k leaves 3,687, so a wave passes the floor it wants.

Both profile backfills take `--wave`, writing to `charity_profiles` for any
registered number:

    pnpm exec tsx --env-file=.env.local ../../scripts/backfill-perfect-topic.ts \
      --wave="2026-10 arts" --income=500000 --limit=50
    pnpm exec tsx --env-file=.env.local ../../scripts/backfill-signature-events.ts \
      --wave="2026-10 arts" --income=500000 --limit=50

Without `--wave` they do what they always did: account charities, whose
suggestions the admin consent queue shows.

**The spend cap** lives in `apps/web/lib/model-spend.ts`, not in a script
flag — decision 4 asks it to cover "admin on-demand touches as well", and
clicking through the queue is the motion that spends invisibly. So the
check sits where the model is CALLED: a wave, a backfill, the organiser's
wizard adding a charity, and an admin's click all pay into one ledger
(`model_spend`) and stop at the same monthly cap (`MODEL_SPEND_CAP_USD`,
default $25). A reached cap costs the suggestions and never the charity or
the favpoll.

**Model per task, not per pipeline.** The none/not-none judgement runs on
the better model (`LLM_JUDGEMENT_MODEL_ID`, default `claude-sonnet-5`) — on
the gold set Haiku offered "Children's book" to the NSPCC and to Save the
Children. The extraction either side of it runs on the cheap one
(`LLM_CLASSIFIER_MODEL_ID`, default `claude-haiku-4-5`). The judgement has
its own env var deliberately: it used to read `LLM_MODEL_ID`, which is the
Story generator's and is pinned to a Haiku id on dev, so a cost decision
about Story copy was silently reassigning this call to the model the
measurement rejected.

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
