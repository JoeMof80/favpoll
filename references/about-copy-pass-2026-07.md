# About-page copy pass — before / after (for review)

_Drafted 8 July 2026. Reviewed against the locked concept model
(`favpoll-concept-model-2026-07.md`) and the favpoll brand voice. Nothing is
changed in the app yet — this is for you to react to first. Tweak wording, veto
anything; once agreed I'll implement, reconcile the brand skill, test, and ship._

The three moments below carry the real problems. Two smaller flags follow.

---

## 1. The opener — category language + honour-fence

**Before**

> favpoll is a charitable polling platform for life's most significant moments.
> Guests pledge real money against their favourite things, in the name of
> someone being honoured. The rankings move in real time. The proceeds go to
> charity.

**After (draft)**

> favpoll is a way of giving that gives something back. Guests pledge real money
> to charity and cast a favourite of their own — and once they've given, the
> favpoll shares back the favourite it was holding. Rankings move in real time,
> and every pledge reaches its charity in full — whether it honours someone,
> backs a cause, or cheers on a fundraiser.

**Why**

- Kills **"charitable polling platform"** — category language the voice guide
  explicitly bans ("a polling tool — too generic").
- Kills **"life's most significant moments"** — favpoll isn't defined by life
  events; it stands alone and pairs with them.
- **"in the name of someone being honoured"** → a closing clause that names all
  four kinds (honour someone · back a cause · cheer on a fundraiser), so it's
  **flagship, not fence**.

---

## 2. "For fundraisers" — the crowdfunding bug

**Before**

> A favpoll doesn't have to honour one person. A cause can carry one — a village
> hall roof, a community appeal, a memorial fund. The poll gives people a reason
> to gather round, the reveal gives them something back, and every pledge goes
> where it was promised.

**After (draft) — split into the two shapes we now understand**

> **For fundraisers.** A favpoll works as well for a challenge as for a person.
> Someone running a marathon, taking a sponsored silence, braving the cold —
> their supporters pledge to the charity they're raising for, cast a favourite,
> and get a reveal in return. Sponsorship, with a moment of delight built in.
>
> **For causes.** And a favpoll needn't have a person at its heart at all. A
> cause can carry one — a hospice, an air ambulance, a charity close to a
> community — with the pledges going straight to the charity behind it.

**Why**

- Removes the **crowdfunding language** entirely ("village hall roof / community
  appeal / memorial fund" → registered charities).
- Separates **fundraiser** (a person's challenge — keeps a protagonist) from
  **cause** (faceless), exactly as we established from the wizard's Who × Type.
- Recipient is **always a registered charity** — never a project fund.

---

## 3. "The record" — demote from destination to principle

**Before**

> **A lasting contribution from a day that meant everything.**
> Every pledge also feeds the record — favpoll's permanent ranking of human
> favourites, built entirely through acts of generosity. It wasn't gamed, and it
> wasn't passively accumulated. It was paid for, freely, by people honouring
> someone they loved.
> [ **See the record →** ]

**After (draft)**

> **Something lasting, built pledge by pledge.**
> Because every ranking here was paid for — freely, by someone who cared —
> favpoll slowly builds something no ordinary poll can: an honest record of what
> people love. Never gamed, never passively gathered. It isn't the point of any
> single favpoll; it's just what they add up to, over time.

**Why**

- Keeps the lovely **"paid for, freely"** principle, but reframes the record as
  a **consequence**, not a headlined destination.
- Drops **"by people honouring someone they loved"** (fence).
- **Removes the "See the record →" CTA** — it points at `/rankings`, which is
  empty, so it's a hollow promise until there's data. (The landing already hides
  its record section below a data threshold; this matches.)

---

## Two flags before I touch code

1. **The triad's "Honour" line** in the identity section reads _"every favpoll is
   an act of remembrance or celebration"_ — literally a fence (a fundraiser or
   cause is neither). But the **Charity · Honour · Love** triad is sacred brand
   identity. My lean: leave the triad as the _soul_ (it may lead with honour as
   the flagship), but I can gently broaden that one line if you'd rather.

2. **An inconsistency in the brand skill itself:** its "Core product facts" still
   say _"A charitable polling platform for life events"_ — which contradicts both
   the concept model **and** the skill's own "what favpoll is not: a polling tool
   (too generic)." Worth reconciling the brand skill in the same pass so the
   source of truth stops fighting itself.

---

## Not touched (deliberately)

- **"Where it started"** (the fifteen-year question, "Data with soul") — this is
  the origin story, correctly positioned as the _deeper why_ further down the
  page. On-model; leave it.
- **"Where the money goes"** ("100% reaches your chosen charity") — accurate and
  on-model. Leave it. (Still references Stripe, which is true today; revisit if
  the disbursement rail changes.)
- **The close** (brand statement + CTAs) — fine.
