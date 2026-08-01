// The mechanic, as three numbered steps — ONE source for every surface
// that teaches it (the guest page's lock card and the print pack's table
// cards/poster, founder, 2026-08-01: guests should read the same
// instructions on the table card as on the page the QR opens).
//
// Step 1 keeps "own" deliberately: it is the single word that dismantles
// the guess-the-protagonist's-favourite misread (Joy, 2026-07-31).

export type MechanicStepsInput = {
  topicTitle: string
  /** "Marie Curie", "A & B", … — null falls back to "charity". */
  charityLine: string | null
  /** Protagonist first name; null for causes or missing names. */
  firstName: string | null
  isCause: boolean
  hasReveal: boolean
}

export function buildMechanicSteps({
  topicTitle,
  charityLine,
  firstName,
  isCause,
  hasReveal,
}: MechanicStepsInput): string[] {
  const topic = topicTitle.toLowerCase()
  const revealStep = !hasReveal
    ? "The standings will be revealed"
    : isCause
      ? "Our pick will be revealed, along with the standings"
      : firstName
        ? `${firstName}'s favourite will be revealed, along with the standings`
        : "The favourite will be revealed, along with the standings"
  return [
    `Pick your own favourite ${topic}`,
    `Pledge what it's worth — it all goes to ${charityLine ?? "charity"}, favpoll takes no fee`,
    revealStep,
  ]
}

/** The escape hatch beneath the steps — a favourite-less guest can still
 *  give, via the shared fund (a pledge itself requires a pick). */
export function mechanicFooter(topicTitle: string): string {
  return `Don't have a favourite ${topicTitle.toLowerCase()}? That's okay — you can still give to the shared fund.`
}
