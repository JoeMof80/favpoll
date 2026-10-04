// The mechanic, as three numbered steps — ONE source for every surface
// that teaches it (the guest page's lock card, the /favpolls flip cards
// and the print pack's table cards/poster, founder, 2026-08-01: guests
// should read the same instructions on the table card as on the page
// the QR opens).
//
// Copy is the founder's card text (2026-08-02); the no-fee fact lives on
// the poster and page microcopy rather than in step 2.
//
// THE PERSONAL REVEAL IS "A NOTE" IN USER-FACING COPY (founder,
// 2026-09-17, after the Yvette session): "Reveal" was always too
// abstract — too mysterious — and collided with step 3's standings
// Reveal. "Note" is register-agnostic and self-descriptive, covers a
// favourite or a message alike, and the possessive survives
// authorship. Step 3 MAY now carry it, conditionally: on note-bearing
// polls the step extends to "…along with a personal note"
// (founder's wording, verbatim; name-forms rejected as
// authorship-claiming). This supersedes the 2026-09-01
// "step 3 never promises the personal reveal" rule — the objection
// then was five awkward variants; "a note" needs one.
//
// STEP 3 IS THE COMPARISON (founder, 2026-09-15, after the Bates Wells
// meeting surfaced the gambling misread): "The standings will be
// revealed" read as an outcome you'd staked on. "Reveal where your
// favourite stands among the others" makes YOUR pick sitting in a
// ranking the point — social, for-fun, implied rather than stated —
// and restores the Pick / Pledge / Reveal triad as three acts that are
// all the guest's. "Reveal" is CAUSATIVE (the pledge is the revealing
// act; the founder weighed the platform-does-it pedantry and dismissed
// it) and attaches to the STANDINGS, true of every favpoll — never the
// personal reveal. Explicit denials ("nothing is won") were drafted
// and REJECTED: an unprompted denial plants the frame it denies ("who
// suggested something would be?").

export type MechanicStepsInput = {
  topicTitle: string
  /** "Marie Curie", "A & B", … — null falls back to "charity". */
  charityLine: string | null
  /** The poll holds a personal note — step 3 says so. */
  hasNote?: boolean
}

// isQuoteReveal / isMessageReveal DELETED 2026-09-17: they only ever
// fed copy forks on the unlock labels, and "a note" (the settled
// user-facing term for the personal reveal) covers every shape —
// favourite, quote or message — with one string. The message-shaped
// reveal remains a CONTENT capability (Marcus' hat poll); it just no
// longer needs detecting.

export function buildMechanicSteps({
  topicTitle,
  charityLine,
  hasNote = false,
}: MechanicStepsInput): string[] {
  const topic = topicTitle.toLowerCase()
  // "A personal note" (founder, 2026-09-17): authorship-neutral — a
  // personal note can be by them or about them — with no name variants.
  // "From X" and the possessive were both auditioned and rejected as
  // authorship-claiming.
  const step3 = hasNote
    ? "Reveal where your favourite stands along with a personal note"
    : "Reveal where your favourite stands among the others"
  return [
    `Pick your favourite ${topic}`,
    `Pledge what it's worth — all money will go to ${charityLine ?? "charity"}`,
    step3,
  ]
}

/** The escape hatch beneath the steps — a favourite-less guest can still
 *  give, via the shared pot (a pledge itself requires a pick). */
export function mechanicFooter(_topicTitle: string): string {
  return "Don\u2019t have a favourite? Give to the shared pot instead"
}
