# Session handoff — 2026-07-23

For the next Fable session. State at close: **clean** — `main` at #363,
suite 1,124 green, no open PRs, nothing uncommitted. Continues
`session-handoff-2026-07-22.md` (+ addenda), which covers #304–#350.

Covers PRs **#351–#363**: the pledged-marker iteration and the
**generator refinement arc** — ten PRs on "Generate a suggestion",
every one driven by the founder catching a real flaw in a real
generation.

---

## 1. Pledged-card marker (#351, #352, #353)

Three rounds to the right answer: soft border + badge (unreadable at a
glance) → solid primary top strip (stood out, "looks crap") → **final:
`border-2 border-primary/50` and nothing else**. Also in #351: the
default Button variant had NO hover on real `<button>`s (the shadcn
rule was `[a]:`-scoped to anchors) — now `hover:brightness-90`
(bg-primary/N LIGHTENS over white; brightness darkens).

## 2. The generator arc (#354–#363)

"Generate a suggestion" went from "remarkable person… meaningful
charitable work" to seed-quality copy. The system, as it now stands
(`lib/actions/generate-draft.ts`):

- **Prompt carries the brand bar**: voice block, cliché ban, "pledge"
  never "vote"; the About OPENS with the protagonist's connection to
  the topic (teased, never named), keeps the charity to a mention, and
  ends with the reveal promised BY NAME ("…and Sylvia's will be
  revealed").
- **Grammar is computed in code, not requested**: reveal opener =
  possessive name + tense by register ("Donald's is", "Margaret's
  was"); Hers/His/Theirs fallback; "Our pick to start:" for causes;
  a not-a-person guard (appeal/fund names → "Theirs is") sits INSIDE
  the reveal instruction so it can't conflict with the opener command.
- **Details are protagonist-owned by rule**: never a real-world fact
  about the favourite (the canonical failure — "watched them play on
  Boxing Day" about Bayern Munich — is cited in the prompt).
- **Cache key v3**: version prefix + charity ALWAYS + name hash (the
  About names the charity; the entity judgement depends on the name —
  drafts must never cross favpolls). v1 had person drafts keyed
  WITHOUT the charity: a real latent bug.
- **callLLM reads the text block by find(), not content[0]** — models
  may lead with a thinking block; content[0]-only silently failed
  generations into the error toast. max_tokens 512. Model default:
  claude-sonnet-5.
- **Suggestions randomise** (pickExampleName / pickContext) — the
  deterministic hash variants remain for stable greyed previews.
- **Grouping outranks register in the name pools** (#363): a couple
  memorial gets "Joan & Arthur", not "Penny"; fundraisers (register
  cause + subject someone) get PERSON names, never appeal names
  (#356); couples/groups pass "they" pronouns; firstNames keeps
  surname-less pairs whole.
- **Context pools** (#362): per-register, random, fundraisers covered
  at last; faceless causes get none.

Placeholders (founder-worded): About = "Two or three sentences: who
this is for, the occasion, and where pledges go. Don't name their
favourite — that's the reveal." Reveal = "Reveal their favourite here —
guests see this only after they pledge. This could be a direct quote
or a memory."

## 3. Working-method notes

- Prompt changes are cheap to LIVE-SMOKE: replicate buildPrompt in a
  scratch script against the real API with the founder's exact
  scenario before shipping — every arc PR was smoked this way and two
  shipped bugs were caught pre-merge by it.
- Exact-string patch scripts keep failing against prettier's wrapping:
  read the file region first, then patch. Twice this evening a failed
  assert left edits half-applied or on the wrong branch (once
  committing to local main — recovered by branch -f + reset).

## 4. Unchanged waits

Leo Chandler DM (live Goodstack thread; Gift Aid question with him),
~27 July Josh chase trigger, launch flip §1b, seeded testbed live
(four catches). Buildable next: mobile-form pass, draft-first wizard,
Doctor Who topic, Tier-2 topics.
