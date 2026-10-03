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
  standings_opened_at?: string | null
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

// THE STANDINGS OPEN, ONE WAY (founder, 2026-10-03: "i wonder if it is
// better to unlock the page when the poll is suspended. the main reason
// the standings are hidden is so as not to influence picks"). Closing
// already unlocks them for everyone, because no pick can follow;
// suspending creates that condition early, and freezes the numbers
// besides, so the lock guards something nothing can move.
//
// It does not close again. The tap is reversible, the knowledge is not:
// resuming the picks after a room has seen the standings would let those
// guests pick with exactly what the lock withholds. So the column is
// stamped at the first suspension and never cleared, and resuming leaves
// the standings open — see the migration.

/** The standings show to everyone, pledge or no pledge. */
export function standingsOpened(favpoll: PicksSuspendable): boolean {
  return !!favpoll.standings_opened_at
}

/** What the pledge still buys once the standings are out: the note, and
 *  nothing else. Shown on the invitation where the lock card stood. */
export const STANDINGS_OPEN_NOTICE =
  "The standings are open. Your pledge still goes to the pot."
