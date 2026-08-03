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
}

/** Inferred, never asked (founder, 2026-08-03): a reveal that opens with
 *  a quotation mark is a quote — no organiser-facing taxonomy UI. */
export function isQuoteReveal(reveal: string | null | undefined): boolean {
  return /^\s*["\u2018\u2019\u201C\u201D']/.test(reveal ?? "")
}

export function buildMechanicSteps({
  topicTitle,
  charityLine,
  firstName,
  isCause,
  hasReveal,
  revealIsQuote = false,
}: MechanicStepsInput): string[] {
  const topic = topicTitle.toLowerCase()
  // "in their own words" only when the reveal actually is a quote —
  // dialled-up intrigue for the one kind that earns it.
  const revealStep = !hasReveal
    ? "The standings will be revealed"
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
