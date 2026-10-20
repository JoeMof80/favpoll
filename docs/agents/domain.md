# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`references/GLOSSARY.md`** — this repo's glossary, and the file the
  skills' `CONTEXT.md` convention refers to. See "Where the glossary lives"
  below.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.
- **`references/`** — the historical archive. See "What `references/` is".

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## Where the glossary lives

This is a **single-context** repo: one domain language across the whole
monorepo (`apps/web`, `apps/admin`, `packages/*`). That is deliberate — a
ubiquitous-language audit in May 2026 made each term mean one thing in
code, in the database, in UI copy and in conversation.

**The glossary is `references/GLOSSARY.md`, not a root `CONTEXT.md`.** 395
lines, 38 terms, each giving what the term is, its name in code, its label
in the UI, and the words it is explicitly _not_. Read it wherever the
skills' convention says to read `CONTEXT.md`.

It is canonical, and it is strict. A few of its rules, as a flavour of how
binding it is:

- A **protagonist** is the person, couple or group being honoured — never
  "honouree", "subject", "deceased" or "user".
- A favpoll has a **topic** and guests **pick a favourite**. A favpoll never
  "asks a question" — that framing is a ghost of a dead field and reads as a
  survey.
- Copy says **pick**, never **choose**.

If a concept you need isn't in the glossary, that's a signal: either you're
inventing language the project doesn't use (reconsider), or there's a real
gap (note it for `/grill-with-docs`).

## What `references/` is

Ninety markdown documents holding the real reasons behind most decisions
made before 2026-10-20 — `PROJECT.md` (1,253 lines) and `audits/` above
all. It is an **archive, not a log**: unindexed, unnumbered, with no
superseded markers, and parts of it are out of date (the July 2026
architecture survey's "no RLS anywhere" finding, for instance, was corrected
by measurement in `audits/tech-debt-2026-10.md`).

Read it for history. Write new decisions as numbered ADRs in `docs/adr/`.

## File structure

```
/
├── CLAUDE.md                      ← repo instructions + this block
├── docs/
│   ├── adr/                       ← new numbered decisions
│   └── agents/                    ← this configuration
└── references/
    ├── GLOSSARY.md                ← the glossary
    ├── PROJECT.md                 ← the long-form archive
    └── audits/                    ← surveys, incl. the debt register
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the glossary. Don't drift to synonyms it explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

The same courtesy applies to a ruling recorded in `references/`: if you are
about to reverse one, say which document it came from and why it no longer
holds.
