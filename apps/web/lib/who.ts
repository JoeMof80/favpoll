import type { FavpollGrouping, FavpollSubject } from "@favpoll/types"

/**
 * The who axis — He/She/They/Pair/Group, or Cause, the answer that says
 * NO ONE. It lived on the wizard's type step, then on the Generate
 * dialog, and since the extended wizard it is an icon dropdown on the
 * Info step's Name field. These helpers are the single mapping from a
 * who answer to the schema's subject/grouping axes.
 */
export type WhoValue = "he" | "she" | "they" | "couple" | "group" | "cause"

export function groupingForWho(who: WhoValue | ""): FavpollGrouping {
  return who === "couple" ? "couple" : who === "group" ? "group" : "individual"
}

/**
 * Cause is an answer to "who is this for?", not a pronoun — it is the
 * answer that says no one (founder, 2026-08-25).
 */
export function subjectForWho(who: WhoValue | ""): FavpollSubject {
  return who === "cause" ? "cause" : "someone"
}
