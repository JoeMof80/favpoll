import type { FavpollGrouping, FavpollSubject } from "@favpoll/types"

/**
 * The who axis — He/She/They/Pair/Group, or Cause, the answer that says
 * NO ONE. It lived on the wizard's type step, then on the Generate
 * dialog, and since the extended wizard it is an icon dropdown on the
 * Info step's Name field. These helpers are the single mapping from a
 * who answer to the schema's subject/grouping axes.
 */
/** "me": the organiser IS the protagonist and writes in the first person
 *  (pronoun "i"; founder, 2026-09-24: "isn't it just another pronoun?";
 *  on the menu since 2026-10-02). */
export type WhoValue =
  | "he"
  | "she"
  | "they"
  | "me"
  | "couple"
  | "group"
  | "cause"

/** The pronoun a who implies — the first-person "i" for "me", none for
 *  a pair, group or cause. */
export function pronounForWho(
  who: WhoValue | ""
): "he" | "she" | "they" | "i" | undefined {
  if (who === "he" || who === "she" || who === "they") return who
  if (who === "me") return "i"
  return undefined
}

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
