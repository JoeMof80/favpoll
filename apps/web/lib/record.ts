import type { Favourite } from "@favpoll/types"

// The record only speaks with authority once a topic has enough behind it.
// Below the bar a topic is "still gathering" — shown, but not presented as
// an all-time verdict, so nobody's single £2 pledge crowns a #1. This is a
// display threshold only: every pledge always counts fully in the numbers
// (founder decision §4 — no caps, no damping; legibility over suppression).
export const RECORD_MIN_PLEDGED_GBP = 500
export const RECORD_MIN_ITEMS_WITH_ACTIVITY = 3

/** An item counts toward a topic's record weight once it has any pledges. */
function itemsWithActivity(
  items: Pick<Favourite, "all_time_pledged">[]
): number {
  return items.filter((i) => i.all_time_pledged > 0).length
}

export function topicPledgedTotal(
  items: Pick<Favourite, "all_time_pledged">[]
): number {
  return items.reduce((sum, i) => sum + i.all_time_pledged, 0)
}

/**
 * Whether a topic qualifies as an established record: enough total pledged
 * AND enough distinct favourites in the running (a lone big pledge on one
 * item is a spike, not a record).
 */
export function isEstablishedRecord(
  items: Pick<Favourite, "all_time_pledged">[]
): boolean {
  return (
    topicPledgedTotal(items) >= RECORD_MIN_PLEDGED_GBP &&
    itemsWithActivity(items) >= RECORD_MIN_ITEMS_WITH_ACTIVITY
  )
}

/**
 * Cross-topic record gate (landing hero tiles): a flat list of the top
 * favourites qualifies once the shown set clears the same bar.
 */
export function meetsCrossTopicThreshold(
  items: Pick<Favourite, "all_time_pledged">[]
): boolean {
  return (
    topicPledgedTotal(items) >= RECORD_MIN_PLEDGED_GBP &&
    items.length >= RECORD_MIN_ITEMS_WITH_ACTIVITY
  )
}
