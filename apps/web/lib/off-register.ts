// OFF-REGISTER NUMBERS (references/charity-profiles-2026-09-27.md §5).
//
// The register favpoll mirrors is the Charity Commission for England and
// Wales. Scotland (OSCR) and Northern Ireland (CCNI) keep their own, with
// their own schemas and their own loaders, and neither is mirrored: an SC
// or NIC number finds nothing in the mirror, nothing in the Commission's
// API, and reads as "no match" — which looks like a typo and sends the
// organiser round the loop.
//
// Naming the limit is a few lines and does two things: it turns a mystery
// into a known boundary, and it is the DEMAND SIGNAL. Nobody is waiting
// for OSCR today; if this message starts firing we will know before
// anyone complains, and the loader for it is a column mapping and about a
// day's work.
//
// It also fails in the safe direction already: an unmirrored number falls
// through to the Commission's API, which does not have it either, so
// verification fails and no account is created. For a system that routes
// money to the verified party, failing closed on an unverifiable charity
// is correct — this only explains why.

export type OffRegisterRegulator = "OSCR" | "CCNI"

/** The regulator an off-register number belongs to, or null — which is
 *  every ordinary query. Deliberately tight: a missed hint costs a
 *  sentence, a false positive tells someone their real search is
 *  unsupported. So it matches a NUMBER and never a name — "scope" and
 *  "nice" fall through, as does an England and Wales number.
 *
 *  Both the bare forms (SC003558, NIC100000) and the standard
 *  identifiers (GB-SC-SC003558, GB-NIC-NIC100000) are recognised. */
export function offRegisterNumber(query: string): OffRegisterRegulator | null {
  // Spaces, dots and hyphens out, then the GB prefix: what is left is
  // the prefix and the digits. The prefix repeats in Scotland's standard
  // identifier (GB-SC-SC003558), hence the (sc)+.
  const bare = query
    .trim()
    .toLowerCase()
    .replace(/[\s.-]/g, "")
    .replace(/^gb/, "")
  if (/^(sc)+\d{3,6}$/.test(bare)) return "OSCR"
  if (/^(nic)+\d{3,6}$/.test(bare)) return "CCNI"
  return null
}

/** What the organiser reads in place of "no match". States the boundary
 *  and promises no date. */
export const OFF_REGISTER_MESSAGE: Record<OffRegisterRegulator, string> = {
  OSCR: "favpoll searches the Charity Commission register for England and Wales. Scottish charities (SC numbers) aren’t on it yet.",
  CCNI: "favpoll searches the Charity Commission register for England and Wales. Northern Irish charities (NIC numbers) aren’t on it yet.",
}
