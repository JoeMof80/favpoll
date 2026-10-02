// SUSPENDED PICKS (founder, 2026-10-02 — the enacted review's revision:
// no second shape, no second close date). An organiser can suspend the
// picks on any favpoll, now or at a set time. From that moment the pick
// step disappears, every pledge is a gift with no favourite attached
// (the shared pot's path), and the standings freeze until the close
// date. It serves the enacted night — the playlist is settled, the room
// keeps giving — and the memorial's late donor alike. The record keeps
// every pick made before it: a favourite is a favourite.

export type PicksSuspendable = {
  picks_suspended_at?: string | null
}

/** True once the suspension is in effect (set and not in the future). */
export function picksSuspended(
  favpoll: PicksSuspendable,
  now: Date = new Date()
): boolean {
  const at = favpoll.picks_suspended_at
  if (!at) return false
  const t = new Date(at).getTime()
  return Number.isFinite(t) && t <= now.getTime()
}

/** Set, but not yet in effect — the organiser scheduled it. */
export function picksSuspensionScheduled(
  favpoll: PicksSuspendable,
  now: Date = new Date()
): boolean {
  const at = favpoll.picks_suspended_at
  if (!at) return false
  const t = new Date(at).getTime()
  return Number.isFinite(t) && t > now.getTime()
}

/** The guest's line, on the lock card's slot and in the pledge dialog
 *  (founder's words, 2026-10-02). */
export const PICKS_SUSPENDED_NOTICE =
  "The picks are in. Your pledge goes to the pot."

/** The standings' line for everyone who can already see them. */
export const STANDINGS_FROZEN_NOTICE =
  "The picks are in. The standings are frozen."
