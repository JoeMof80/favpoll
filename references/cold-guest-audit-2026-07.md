# Cold-guest audit — the favpoll page with zero context

_8 July 2026. Premise (from the three-surface model): the guest is handed a QR
at a wake or a birthday and has never heard of favpoll. Their entire onboarding
is this page. This audit walks the open-favpoll guest surface as that visitor
and flags every place it presumes knowledge. Verified against the actual
components; nothing changed yet._

---

## What already works (genuinely)

- **The hero is human and self-evident** — occasion eyebrow, name, photo,
  about. A cold guest immediately knows _whose_ page this is.
- **The charity banner is quietly excellent** — named charities, `Charity no.`,
  a Charity-Commission "verified" badge, per-charity amounts, "raised so far".
  Strong implicit trust.
- **The pledge dialog steps are clear** once entered — "Choose your favourite
  biscuit" → "Your pledge" (£ presets, Stripe note) → name/privacy → pay. The
  privacy affordances (hide name, "appear as Someone") are considerate.
- **Server-side gating is real** — amounts/reveal genuinely absent from the
  payload pre-pledge, not just blurred. No leak.

---

## Findings, ranked

### 1. The trust claims arrive too late ⚠ biggest issue

**"favpoll takes no fee — 100% of your pledge goes to charity"** appears
exactly once: _inside_ the pledge dialog, at step 2 — after the guest has
already tapped in and chosen a favourite. On the page itself, nothing states
where the money goes; the charity banner implies it, but a cold guest deciding
_whether to tap at all_ may assume the family or the organiser collects.

**Fix (small):** one quiet line on the page surface, near the lock pill or
under the poll heading — e.g. _"Pledges go to {charity name} — favpoll takes no
fee."_ Data is already on the page (charity names are right there). Highest
value-per-effort change in this audit.

### 2. The reveal — RESOLVED: show it, don't explain it (founder decision, 8 Jul)

Original finding: pre-pledge, the guest meets the word "reveal" with no
in-place explanation, and the framing question documented by the brand skill
(`personal_framing`) turned out to be a **dead column** — deliberately absorbed
into the About text.

**Resolution:** the About field replaced the framing on purpose, and the guest
page *shows* the mechanic rather than explaining it — blurred decoy + lock
pill ("Pledge to reveal Margaret's favourite") let the guest feel
withhold-then-disclose without meta-commentary. The mystery is load-bearing;
explaining it would deflate it. The reveal's per-register meaning (a memorial's
last word vs a birthday punchline) is carried by the organiser's own About +
reveal writing — steered by register-aware wizard placeholders — not by
platform copy. Brand skill + glossary updated to match reality.

**Residual small items (copy-level, not concept):**
- Prefer the **verb** form everywhere. "Pledge to reveal X's favourite" (pill)
  is plain English and self-explanatory; the decoy placeholder's noun form
  ("Pledge to see their reveal.") is the jargon usage — harmonise it to the
  verb form.
- **No-reveal favpolls:** verify the lock pill doesn't promise a reveal when
  `personal_reveal` is empty (a cause favpoll with no reveal must say
  "…and see the results", not promise a disclosure that never comes).

### 3. The primary button is a noun

The way in is a full-width primary button labelled **"FAVOURITE COLOUR"** — a
topic title, not an action. Styled as a button, reads as a heading. A cold
guest's actual invitation is the lock pill lower down (verb-labelled, good).
Two options:
- Leave it (the lock pill is the true CTA; the heading-button is a secondary
  entrance), or
- Give it an action hint — e.g. a small "cast yours →" suffix or sublabel —
  without breaking the merged header/trigger design.

Low urgency; worth a decision when touching the poll section.

### 4. The shared-fund card sends mixed signals

Card copy says **"£40 available for guests who need help to pledge"** — an
offer to _use_ it — but its only button is **"Add to the shared fund"** — an
ask to _give_. A guest who needs the fund can't see from the card that the way
to use it is inside the pledge dialog (a "Use shared fund" tab at step 2). A
guest who'd donate may think the card is telling them help is available.

**Fix (copy-level):** make the card do both jobs explicitly — one line for
givers ("top it up so others can take part"), one for users ("choose 'Use
shared fund' when you pledge") — or split the affordances.

### 5. Minor notes

- **Blurred decoy text** ("Pledge to see their reveal." ×3) is semi-legible
  under `blur-xs` and reads oddly if squinted at. Cosmetic.
- **Guest wall teaser missed:** pre-pledge rows read "Alex pledged · 5m ago"
  with the backed-favourite silently stripped. Nothing hints that more detail
  appears after you pledge — a free nudge going unused ("pledge to see what
  guests backed").
- **"Guest wall"** as a heading is mild jargon but comprehensible; empty state
  explains it. Fine.
- **Countdown, tabs, rankings**: self-evident. Fine.

---

## Quick-win list (if you want a small PR without the framing decision)

1. Trust line on the page surface (finding 1).
2. Shared-fund card copy (finding 4).
3. Guest-wall teaser line (finding 5).

Finding 2 (framing question) and finding 3 (noun button) are decisions, not
tweaks — take them separately.
