// The mechanic, as three numbered steps — ONE source for every surface
// that teaches it (the guest page's lock card and the print pack's table
// cards/poster, founder, 2026-08-01: guests should read the same
// instructions on the table card as on the page the QR opens).
//
// Copy is the founder's card text (2026-08-02); the no-fee fact lives on
// the poster and page microcopy rather than in step 2.

export type MechanicStepsInput = {
  topicTitle: string
  /** "Marie Curie", "A & B", … — null falls back to "charity". */
  charityLine: string | null
  /** Protagonist first name; null for causes or missing names. */
  firstName: string | null
  isCause: boolean
  hasReveal: boolean
  /**
   * The reveal opens with a quotation mark (see isQuoteReveal) — step 3
   * promises "their own words". A boolean, never the text: pre-pledge
   * surfaces must not receive reveal content.
   */
  revealIsQuote?: boolean
  /**
   * The reveal is a message rather than a named favourite (see
   * isMessageReveal). Takes precedence over both isCause and revealIsQuote:
   * "our pick" would be wrong about a message, and "in their own words" is
   * redundant of one.
   */
  revealIsMessage?: boolean
}

/** Inferred, never asked (founder, 2026-08-03): a reveal that opens with
 *  a quotation mark is a quote — no organiser-facing taxonomy UI. */
export function isQuoteReveal(reveal: string | null | undefined): boolean {
  return /^\s*["\u2018\u2019\u201C\u201D']/.test(reveal ?? "")
}

/**
 * Does this reveal decline to name a favourite — i.e. is it a MESSAGE rather
 * than the usual disclosure?
 *
 * WHY IT EXISTS (founder, 2026-08-29: "lets have Marcus reveal something
 * other than his favourite"). Most reveals name one: "Purple. She wore it to
 * every important occasion." But a favpoll whose poll DECIDES something —
 * one whose TOPIC IS the outcome — cannot have one. The reveal is written at
 * creation, before any pledge, so the organiser's "favourite" would be a bet
 * on an undecided result rather than a fact about them: unwritable in
 * advance, and reading as either campaigning or losing whichever way it
 * lands.
 *
 * /fundraisers is the one surface demonstrating it: Marcus Bell wears
 * whichever hat the room picks, so his OWN favourite hat would be a hollow
 * thing to disclose, and he gives back a remark instead. If a future edit
 * gives him a favourite again, this capability goes undemonstrated.
 *
 * It stands on its own merits either way: the brand guide says an empty
 * reveal is fine and not to force one, which means those favpolls have
 * nothing at all behind the lock today.
 *
 * DERIVED, NOT STORED, exactly as isQuoteReveal is. No column, no migration
 * and no wizard field: an organiser who writes a message instead of a
 * favourite simply gets copy that says so.
 *
 * THE OPENING SENTENCE ONLY. The house pattern puts the favourite there —
 * "Purple.", "Ours will hopefully be Chengdu." — and
 * testing the whole reveal would misread a message that happens to mention an
 * option in passing.
 *
 * FAILS TOWARDS TODAY. Every uncertain case returns false, which produces the
 * exact copy this function did not exist to produce, so it can only improve
 * on the status quo and never regress it. That includes the empty-labels
 * case: with nothing to match against, a reveal cannot be shown to name
 * nothing.
 *
 * CONTENT-FREE, which matters because it is computed server-side and sent to
 * un-entitled viewers alongside `hasReveal` (see app/favpolls/[id]/page.tsx).
 * It discloses one bit — whether the reveal names an option — and never which
 * one, so it narrows nothing a guest did not already know from the mechanic.
 */
export function isMessageReveal(
  reveal: string | null | undefined,
  favouriteLabels: readonly string[] | null | undefined
): boolean {
  const text = (reveal ?? "").trim()
  if (!text) return false
  const labels = (favouriteLabels ?? []).filter((l) => l?.trim())
  if (!labels.length) return false
  const opener = (text.split(/(?<=[.!?])\s/)[0] ?? text).toLowerCase()
  return !labels.some((l) => opener.includes(l.trim().toLowerCase()))
}

export function buildMechanicSteps({
  topicTitle,
  charityLine,
  firstName,
  isCause,
  hasReveal,
  revealIsQuote = false,
  revealIsMessage = false,
}: MechanicStepsInput): string[] {
  const topic = topicTitle.toLowerCase()
  // "in their own words" only when the reveal actually is a quote —
  // dialled-up intrigue for the one kind that earns it.
  const revealStep = !hasReveal
    ? "The standings will be revealed"
    : revealIsMessage
      ? firstName
        ? `${firstName}'s message will be revealed along with the standings`
        : "A message will be revealed along with the standings"
      : isCause
        ? "Our pick will be revealed along with the standings"
        : firstName
          ? revealIsQuote
            ? `${firstName}'s favourite will be revealed in their own words, along with the standings`
            : `${firstName}'s favourite will be revealed along with the standings`
          : revealIsQuote
            ? "The favourite will be revealed in their own words, along with the standings"
            : "The favourite will be revealed along with the standings"
  return [
    `Pick your favourite ${topic}`,
    `Pledge what it's worth — all money will go to ${charityLine ?? "charity"}`,
    revealStep,
  ]
}

/** The escape hatch beneath the steps — a favourite-less guest can still
 *  give, via the shared fund (a pledge itself requires a pick). */
export function mechanicFooter(topicTitle: string): string {
  return `Don't have a favourite ${topicTitle.toLowerCase()}? That's okay — you can still give to the shared fund.`
}
