# Yvette session → improvement tracks

> Source: founder demo with Yvette, 17 September 2026. Second cold-reader
> session after Hannah (Bates Wells). Working notes for prioritisation —
> not yet commitments.

## What she found

| # | Finding | Founder's read |
|---|---------|----------------|
| 1 | After scanning the QR she didn't immediately know where to click | First-tap ambiguity on the guest page |
| 2 | The first example "felt pointless" **until she saw the reveal** | The reveal is the click-moment; needs emphasis (it was deliberately downgraded when it became optional) |
| 3 | The charity should be emphasised in the instructions | "All we are actually doing is donating to charity… as first contact for new users, maybe charity is key" |
| 4 | The marathon-hat exemplar "brought the idea to life" | The winning hat is worn on the day — connecting poll to event with extra meaning |
| — | Audience hypothesis: favpoll is female-coded | Women organise events and make them meaningful; the founder's own "is this pointless?" doubt may be a male reading |

---

## Track 1 — The lock-card button affordance (downgraded)

Founder review (2026-09-17): the QR finding was smaller than first
recorded — it took Yvette a second to realise **the Gift button was a
button**. Not a landing/viewport problem; a button-affordance one.

- Look at the lock-card CTA's button-ness (shape, weight, motion) —
  does the Gift icon + pill read as tappable at a glance?
- The QR machinery ideas (`?src=qr`, identity-bar CTA) are parked
  unless the affordance fix underdelivers.

## Track 2 — Reveal in the instructions, where one exists

Founder direction (2026-09-17): include the personal reveal in the
INSTRUCTIONS — lock card, flip cards, **and stationery** — on polls
that have one, emphasised like the charity.

- **Doctrine care (#881)**: step 3's "Reveal" belongs to the
  STANDINGS; the instruction list must not carry two "reveals" or the
  gambling-misread settlement re-opens. Shape: a conditional extra
  line on reveal-bearing polls, worded to avoid the second "reveal" —
  e.g. *"Marcus' own favourite is shared with you."* Founder wording.
- Plumbing is ready-made: `lib/mechanic-steps` feeds lock card, flip
  cards and the print pack, and the print pack generates per-favpoll —
  a conditional line flows everywhere at once.
- The never-promise rule is untouched: it protects MARKETING surfaces;
  a poll page / insert card for a reveal-bearing poll states a fact.
- Supporting ceremony (pill weight, About-text withhold) stays on the
  menu behind the instruction change.

## Track 3 — Charity-first instructions

- Name the charity **inside the mechanic steps**: step 2 becomes
  *"Give what it's worth — every penny to St Richard's Hospice."*
  One change in `lib/mechanic-steps` feeds lock card, flip cards and
  the print pack.
- Surface the **direct-donate bypass** at the point of contact:
  *"Just want to give? Donate without picking →"* on or near the lock
  card, jumping straight to the amount step. The machinery exists
  ("Give without picking"); it is currently hidden until the dialog
  opens.
- Both touch doctrine-laden copy (#881) — founder wording, assistant
  plumbing.

## Track 4 — The enacted poll: one use case, fundraiser-shaped

Founder review (2026-09-17): treat the enacted poll as **a use case,
not a platform lean**. It depends heavily on homemade (custom) topics,
which don't aggregate — leaning into it would undermine the record.
It suits the **fundraiser** event type best.

The pattern: the standings do something real — the winning option is
performed at the event. Intrigue without gambling: nobody wins
anything; the outcome is an act of the event itself.

- **Do**: a fundraiser exemplar (the marathon hat itself — the winning
  hat worn at mile 20), created founder-side via the UI; possibly a
  fundraiser wizard placeholder or register-page pro-section bullet.
- **Don't**: register-wide "let the poll decide" copy, or exemplars
  that push custom topics across every register.
- Kept for reference, one per register at most: skydive costume
  (fundraiser), first-dance song (celebration), hymn/reading
  (memorial, gently), shelter-dog name (cause).

---

## Suggested order

1. Charity-in-steps copy + conditional reveal line (founder wording,
   one `lib/mechanic-steps` change flows to lock card, flip cards,
   print pack)
2. Lock-card button affordance look
3. Marathon-hat fundraiser exemplar (founder-side, runs alongside)
