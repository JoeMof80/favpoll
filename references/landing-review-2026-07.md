# Landing page review — sections vs the updated concept (for review)

_8 July 2026. Reviewed against the concept model (three surfaces: the landing's
one audience is the **prospective organiser**) after the hero rebuild. Hero +
demo judged mostly fine and left alone. Nothing changed yet — react to the
verdicts and the proposed arrangement first._

---

## The structural finding

The sections below the hero are a **feature list, not a journey**. The order —
reveal · in the room · live now · record · how it works — doesn't follow the
questions a prospective organiser actually asks:

1. What is this? _(hero — done)_
2. **Will it work for my occasion — and will my guests get it?** _(missing —
   your universality section)_
3. What will my guests feel? _(the reveal)_
4. What do I have to do, and what do I get? _(create → share → it runs itself)_
5. Can I trust it with my people's money? _(0%, registered charities — currently
   buried in the rail card + footer)_
6. Is it real? _(live favpolls)_

Two sections also **duplicate the hero demo** (which already plays the full
pick → pledge → reveal arc), and one is **honour-locked** in exactly the way the
concept model retired.

---

## Section-by-section verdicts

### 1. `#reveal` — "Locked until you've given" + interactive demo

**Idea: keep. Execution: mostly keep — one sharpen.**
The click-it-yourself reveal demo is the best moment on the page — the visitor
_does_ the mechanic instead of watching it. Overlap with the hero demo is
acceptable because the interaction differs (you click; the hero plays itself).
Sharpen: the intro copy ("Every favpoll holds one answer back — what the person
it honours actually loved") is person-fenced — needs a line that admits
fundraiser/cause reveals.

### 2. `#room` — "Runs on a link. Comes alive in the room."

**Idea: keep (it IS the amplifier, on-model). Execution: tighten.**
- The two cards are unbalanced — "On its own" is a bare paragraph beside a rich
  "In the room" card (live-display mock + QR). Either give "On its own" a small
  visual (e.g. a mini favpoll-card thumbnail) or restructure as one card with
  two modes.
- It undersells what we've shipped: no mention of the **print pack** (poster +
  table cards) — "the QR code goes on the tables" implies it without showing
  the actual feature.

### 3. `#live` — "Live right now"

**Keep as is.** Proof-of-life, real cards, already gated when empty. Fine.

### 4. `#record` — "The current record holders"

**Idea: demote (concept says principle, not destination). Execution: currently
moot** — threshold-gated, so invisible until data exists. When it does fire,
"record holders" + "See the full record →" is destination-framing. Low
priority: reframe the heading/copy toward "what every pledge adds up to" at the
same time as the copy pass, or leave gated and fix before launch.

### 5. `#how` — "How it works" three-beat

**The clearest miss — replace.** Three problems:
- **Honour-locked copy**: "Introduce them… the person being honoured… your
  person's name… what your person loved". Fences out fundraisers and causes —
  precisely what the concept model retired.
- **Duplicates the hero demo**: it re-tells the guest's pick → pledge → reveal,
  which the demo already shows better.
- **Wrong audience mid-component**: step 1 addresses the organiser, steps 2–3
  narrate the guest. The three-surface model says this page speaks to the
  organiser only.

**Replace with the organiser's three steps** (the genuinely untold story):
1. **Create** — pick who or what it's for, a topic, your charity. Minutes.
2. **Share** — one link, or a printable pack of QR posters and table cards.
3. **It runs itself** — rankings live, the reveal waiting for each guest, and
   when it closes, 100% goes to the charity.

Step 3 naturally carries the **trust beat** (0%, registered charities) — which
kills the need for a separate money section.

### The rail nav

Update anchors to match whatever the final section set is.

---

## The new section — "Anyone can answer" (your universality idea)

**Yes — this fills the real gap.** Nothing on the landing addresses the
organiser's core anxiety: _"will my guests get it — will anyone feel left
out?"_ And nothing showcases **topics**, the actual substance of a favpoll.

Two halves, one section:

- **Universal by default.** The best favpolls ask something everyone can
  answer — a favourite colour, a season, a biscuit. No knowledge needed, no
  guest left out; a grandmother and a grandson answer the same question as
  equals.
- **Custom when you want it.** Or make it yours entirely: your own question,
  your own list of answers. An office leaving do votes on the best meeting
  room; a football club on its greatest ever kit.

**Execution sketch:** a row/shelf of real topic chips (Colour · Season ·
Biscuit · Song · Film…) for the universal half, and a small mock card with
obviously-custom items for the custom half. Placement: directly after the
reveal section (question 2 in the journey — answered right after "what is
this").

_(Copy above is sketch-level, not final.)_

---

## Proposed new arrangement

| # | Section | Status |
|---|---------|--------|
| — | Hero + demo + kind nav | unchanged |
| 1 | The reveal (interactive) | keep, un-fence the intro line |
| 2 | **Anyone can answer** (universal + custom) | **new** |
| 3 | On its own / in the room | keep, rebalance + add print pack |
| 4 | How it works — **organiser's** 3 steps (create · share · it runs itself, incl. 0% trust beat) | replace |
| 5 | Live right now | unchanged |
| 6 | The record | leave gated; reframe copy when addressed |
| 7 | Closing CTA | unchanged |

Rail nav follows.

---

## Suggested build order (each its own small PR)

1. **Replace the how-it-works three-beat** — worst offender, self-contained.
2. **New "Anyone can answer" section** — needs a design pass on the topic shelf.
3. **Rebalance "In the room"** + print-pack mention.
4. **Reveal intro line + record reframe** — small copy fixes, can ride along.
