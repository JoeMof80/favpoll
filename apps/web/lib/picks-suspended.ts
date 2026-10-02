// SUSPENDED PICKS (founder, 2026-10-02 — the enacted review's revision:
// no second shape, no second close date, and no schedule either: "if
// there is a moment at which the guests are ready to act, that is the
// moment to suspend"). The organiser suspends the picks on any favpoll
// with one tap from manage. From that moment the pick step disappears,
// every pledge is a gift with no favourite attached (the shared pot's
// path), and the standings freeze until the close date. It serves the
// enacted night — the playlist is settled, the room keeps giving — and
// the memorial's late donor alike. The record keeps every pick made
// before it: a favourite is a favourite.

export type PicksSuspendable = {
  picks_suspended_at?: string | null
}

/** The picks are suspended — the server stamps the moment, so set means
 *  in effect. */
export function picksSuspended(favpoll: PicksSuspendable): boolean {
  return !!favpoll.picks_suspended_at
}

/** The guest's line, on the lock card's slot and in the pledge dialog
 *  (founder's words, 2026-10-02). */
export const PICKS_SUSPENDED_NOTICE =
  "The picks are in. Your pledge goes to the pot."

/** The standings' line for everyone who can already see them. */
export const STANDINGS_FROZEN_NOTICE =
  "The picks are in. The standings are frozen."
