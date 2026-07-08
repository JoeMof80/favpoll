# About page — lean, show-don't-tell sketch (for review)

_Drafted 8 July 2026. The about page stops trying to **define** favpoll (the demo
does that better) and stops leading with the **origin story** (that's press/
investor material, and it's the record ambition we demoted). It shows, states its
principles, and offers a way to reach you. Four sections. React to the shape and
the little prose it needs; nothing is built yet._

---

## 1. Top — the soul, no explanation

- **Eyebrow:** About favpoll
- **Big line (the brand statement, verbatim, never reworded):**

  > Expressions of joy, for charitable causes, in the name of those we love.

- **No explanatory paragraph.**
- **One quiet link:** _See favpoll in action →_ (to `/` or `/favpolls`) — the
  landing already _shows_ favpoll, so the about page points there rather than
  re-embedding the demo. Handles the visitor who lands here directly.

_(No "show" section — the mechanic isn't re-demonstrated here. The landing does
the showing; duplicating it would blur the two pages' jobs.)_

---

## 2. Principles — charity · honour · love, and 0%

The soul, stated briefly. Keep the existing triad (it's brand-core):

- **Eyebrow:** Charity · Honour · Love
- **Heading:** Three things that rarely appear together.
- **Charity** — every pledge goes to a cause chosen in someone's name.
- **Honour** — every favpoll marks a moment that matters. _(broadened from "an
  act of remembrance or celebration", which fenced out fundraisers and causes —
  flag if you'd rather keep the original)_
- **Love** — every answer is a small piece of what someone genuinely cares about.

Then the money, quietly (no exclamation, no hard sell):

> favpoll takes no fee. Every pledge reaches the charity you choose, in full.

---

## 3. Contact — the new bit

Replaces the charity page's lone "Get in touch" mailto with a proper form, for
the audiences who actually read an about page.

- **Eyebrow:** Get in touch
- **Heading:** We'd love to hear from you.
- **Line:** Whether you're a charity wondering how favpoll works, a partner with
  an idea, or a writer with a question — this reaches us.
- **Fields:**
  - Name
  - Email
  - "I'm getting in touch as…" (select: a charity · a partner · press · a will
    writer · something else)
  - Message
- **On submit:** a short thank-you; message routed to you.

**Build note (its own step):** the form is a small piece of real work — a client
form + a server action that emails via the existing `lib/email` infra (or writes
to a `contact_messages` table), with the `lib/rate-limit` guard and `escapeHtml`
already in place. Not a copy change; scope it after the shape's agreed.

---

## What goes / stays / moves

- **Goes:** the "charitable polling platform…" definition; the "Occasion by
  occasion" section (incl. the crowdfunding-bug "For fundraisers" text — deleted,
  not rewritten); the headlined "The record" section + its empty-`/rankings` CTA.
- **Stays:** the brand statement; the charity·honour·love triad; the 0% fact.
- **Moves:** the origin story ("fifteen years", "data with soul") → press /
  investor material, not the public about page.
