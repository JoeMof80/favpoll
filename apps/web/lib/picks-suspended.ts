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
  picks_first_suspended_at?: string | null
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

// A SUSPENDED FAVPOLL READS AS A CLOSED ONE (founder, 2026-10-04: "just
// treat a suspended poll like it is closed, with note and standings
// revealed. the only difference is that users can continue to pledge, but
// only to the shared pot, via the pledge FAB"). The standings were
// withheld so as not to influence picks; once there are no picks to
// influence, and the numbers are frozen besides, the lock guards nothing.
//
// It does not shut again. The tap is reversible, the knowledge is not:
// resuming the picks after a room has seen the reveal would let those
// guests pick with exactly what the lock withholds. So the moment is
// stamped at the FIRST suspension and never cleared — which is what the
// column is named for, rather than for what it opens.

/** The picks have been suspended at some point, so the reveal is out —
 *  standings and note — and stays out even if the picks resume. */
export function picksEverSuspended(favpoll: PicksSuspendable): boolean {
  return !!favpoll.picks_first_suspended_at
}
