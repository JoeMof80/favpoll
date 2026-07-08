# favpoll — the concept model (v1, to lock)

_The single source everything downstream derives from: copy, the hero demo,
nav, even feature emphasis. Drafted 7 July 2026 to end the "snowblind" problem —
the pages had been weighting every idea equally and conflating what favpoll *is*
with what it's *for*._

---

## In one line — what favpoll IS

**favpoll is a charitable poll with a reveal: you pick a favourite, pledge real
money to charity, and the favpoll shares back what it was holding.**

Universal and register-agnostic — no person and no life event required. That is
the whole product. Everything else is application or amplifier.

## The spine — the guest's experience

**Pick → Pledge → Reveal.**

- **Pick** — you choose your own favourite. You put something of yourself in.
- **Pledge** — real money, to charity (up to 3, split equally). This is what
  makes the answer honest: it cost you something.
- **Reveal** — after you give, the favpoll shares back what the person (or
  organiser) loved. A gift, not a gate. _Signature, but optional — some favpolls
  have no reveal, and that's fine._

The spine is register-agnostic — nothing in it assumes a person is honoured, so
it works identically for a memorial, a cause, or a standalone favpoll. Adopting
it as the copy spine is what stops honourless favpolls being downgraded.

## Why it's different — the two pillars

1. **Money makes preference honest.** A click costs nothing; a pledge costs
   something. Rankings built from pledges are paid-for, not gamed.
2. **The reveal is a two-way act.** You share something of yourself; you receive
   something back. A moment of connection — never a paywall.

## What it's FOR — all first-class (these are the registers)

The schema already models these (`remembering`, `celebrating_one`,
`celebrating_many`, `cause`, `neutral`). None is a sub-case of another.

The create wizard actually models this as **two axes**, which matters:

- **Who** — He / She / They (a person) · A couple · A group · **A cause**. Only
  "A cause" has no protagonist.
- **Type** — Celebration · Memorial · **Fundraiser**.

They combine freely — so **"Fundraiser" is a _Type_, not a Who.** A marathon
runner is _a person + Fundraiser_ and **keeps their protagonist** (name, photo,
bio). Only _A cause_ is faceless. (Internally `deriveRegister` collapses both a
person's fundraiser and a faceless cause into the `cause` register — so
"register" alone can't tell you if there's a person; the `event_subject` field
does.)

The visitor-facing **kinds** (used by the demo nav and copy) are therefore:

- **Remembering / In memory** — memorials, tributes. _The emotional flagship,
  and the origin._ Has a protagonist.
- **Celebrating** — a person, a couple, a group. Birthdays, retirements,
  weddings, teams. Has a protagonist.
- **A fundraiser** — a person's charitable challenge (a marathon runner).
  **Has a protagonist.** The vivid "favpoll beyond a life event" case.
- **For a cause** — faceless; no person. The cause is the _subject_; the
  **recipient is still a registered charity** (e.g. the local hospice, mental
  health via Mind). _Not_ a project fund. No protagonist.

None of these is an afterthought — the copy and demo give each real presence.
(The `neutral` "Open / other" register stays a valid organiser fallback but is
**not a featured demo scene** — it's abstract, and the fundraiser now carries
the "no life event needed" point far more concretely.)

## Boundary — what favpoll is NOT (yet)

**The recipient is always a registered charity.** favpoll pays registered UK
charities (up to 3, split equally) via the charitable rail; there is no
mechanism — and no intent — to pay a project, a personal fund, or the organiser.

So favpoll is **not crowdfunding**:

- No raising money for a specific non-charity **project** ("a village hall
  roof", "a community appeal").
- No **personal / DIY fund**, and no **self-beneficiary** (you cannot honour
  yourself and be the charity).
- A "**cause**" favpoll means a _charitable cause with a registered-charity
  recipient_ — never a project fund dressed as a cause.

Crowdfunding was **deliberately deferred** (prior decision) — it would break the
charity pillar of the triad, sit outside the disbursement rail (Goodstack Impact
Foundation → registered charities), and forfeit Gift Aid. Do not reintroduce it
through copy examples.

_Known copy bug: the about page's "For fundraisers" section currently uses
crowdfunding language ("a village hall roof, a community appeal, a memorial
fund") — fix in the step-3 copy pass._

## The amplifier — life events

A favpoll stands alone. **Pair it with an occasion and it gains two things:**

- **The room** — the live display: rankings shifting on a screen as guests
  pledge from their phones.
- **The stationery** — printed posters and table cards with the QR, for the
  venue.

Life events are how favpoll gets _richer_, not what favpoll _is_. Promote the
pairing and its live + print rewards prominently — but never let it define the
product.

## The record — handle with care

The record (the permanent, paid-for ranking of human favourites) is favpoll's
true north and origin. But **there is no data yet, and it may never be the
product's public face.** Therefore:

- It is a **principle**, true from pledge one: _nothing here is gamed or free —
  every standing was paid for._
- It is **not a destination we headline today.** No "see the all-time record" as
  a present-tense promise until the data can carry it.
- Founder motivation ≠ user-facing identity. Keep the soul; don't write cheques
  the data can't cash. (The landing already hides the record section below a data
  threshold — the fix is mostly tone + the about page.)

## The three surfaces — one audience each (decided 8 July 2026)

The guest never chooses favpoll — they're handed it (QR on a table card, a
link in a group chat). So **the guest needs no marketing page at all**, and
each surface serves exactly one audience:

| Surface          | Audience                                | Job                                              |
| ---------------- | --------------------------------------- | ------------------------------------------------ |
| **Favpoll page** | Guest                                   | Self-evident participation, **zero context**     |
| **Landing**      | Prospective organiser                   | Show the guest experience → "Create a favpoll"   |
| **About**        | Charities, press, partners, will-writers | Trust + contact                                  |

Consequences:

- The **hero demo shows the guest experience, but its job is to sell the
  organiser** on what their guests will feel. Show-don't-tell serves the
  organiser's decision, not guest instruction.
- **Never add guest instruction to the landing** ("how to pledge" etc.) —
  guests won't be there. The guest's entire onboarding is the favpoll page
  itself, which must work for a cold visitor with no context.
- The favpoll page's self-evidence is a **testable claim** — audit it as a
  zero-context visitor, don't assume it.

## Emphasis hierarchy — what the pages should do

- **Lead:** the act + the spine (pick → pledge → reveal), stated with confidence,
  register breadth visible.
- **Support:** the amplifier (room + stationery), live favpolls, the reveal demo.
- **Recede:** the record (→ a principle-line + a quiet link; full home on
  `/rankings`); the origin story ("data with soul", the fifteen-year question →
  about page, further down); wills (→ nested within remembering).

## Sacred & fixed — do not reword

- Brand statement: _"Expressions of joy, for charitable causes, in the name of
  those we love."_

These are honour-centric **by design** — they express the **flagship, not the
fence.** They lead emotionally; the breadth (cause, standalone) lives beside
them, not instead of them.

## Voice guardrails

- **No category language** — never "polling platform / polling tool / a
  charitable polling platform." _Do_ the thing; don't label it.
- **Confident, not explanatory.** The design got more restrained; the copy
  should too — fewer ideas per page, said with conviction.

## Decisions (7 July 2026)

1. **Headline — CHANGING it.** The old fixed headline ("Honour them through what
   they loved…") overlapped the brand statement (same honour+charity sentiment,
   rearranged) and was honour-locked (the fence). New division of labour across
   the hero's three lines:
   - **Eyebrow** (rotates) → the register/occasion, incl. cause + standalone.
     Honour stays prominent _here_. This is the flagship + breadth.
   - **Headline** → a **register-agnostic universal hook** — the job the brand
     statement can't do. **CHOSEN: "Turn what you love into what you give."**
     (Reveal spark carried by the eyebrow + first section, not the headline.)
   - **Brand statement** (sub-line) → the soul. Unchanged/sacred.
   - Tension to hold: a universal headline risks losing the **reveal** spark —
     carried by the eyebrow + the hero demo itself (blur → lock → reveal in
     every scene). _(Updated 8 Jul: the standalone reveal section + interactive
     demo were cut in the artifact-first pass as duplication of the hero demo.)_
   - _Changing the headline means updating the favpoll-brand skill once locked._
2. **Demo scenes — cut by visitor _kind_, not raw register.** Because
   `deriveRegister` collapses a person's fundraiser and a faceless cause into
   `cause`, the demo tags scenes by a visitor-facing `kind`
   (memorial · celebration · fundraiser · cause) so the two read as the
   different things they are. Four scenes:
   - **In memory** (protagonist), **A celebration** (protagonist),
     **A fundraiser** (protagonist — a marathon runner), **For a cause**
     (faceless, no protagonist).
   - **Standalone/"Just because" (neutral) was DROPPED** as a featured scene —
     weak and abstract; the fundraiser carries the "beyond a life event" point
     concretely. Neutral stays a valid organiser fallback, just not a demo.
3. **Nav labels — softened for visitors** (demo tap-to-jump, distinct from the
   organiser create-flow chips): **"In memory" · "A celebration" · "A
   fundraiser" · "For a cause."** (Implemented, PRs #200–#203.)
