// A TO-ONE EMBEDDED RELATION ARRIVES AS AN OBJECT OR AS A ONE-ELEMENT
// ARRAY, AND WHICH ONE IS NOT RELIABLY KNOWABLE (#1106, 2026-10-20).
//
// This is not a new discovery in this codebase. `lib/poll-title.ts` has
// said so since the subset work — "PostgREST hands back an object or a
// one-element array depending on the join, so both are accepted" — and
// `app/appeals/[slug]/page.tsx` carries a dated note calling it "the
// charity-shelf lesson, 2026-09-06".
//
// What #1106 found is that the knowledge was applied in half the places.
// Six sites did this, and are right:
//
//     const topicMeta = Array.isArray(poll.topics) ? poll.topics[0] : poll.topics
//
// Seven others did this, and are not:
//
//     const own = ec.charities as unknown as Charity | null
//
// The second form is not merely untyped — it is WRONG whenever the
// relation arrives as an array. The cast says "object or null", the value
// is `[{...}]`, and every field read off it is `undefined`: no error, no
// crash, just a charity with no name. Every Supabase client in this repo
// is constructed without a `Database` type, so nothing was ever going to
// catch that.
//
// So this helper is not about tidiness. It is the six sites' behaviour,
// written once, so the other seven stop asserting something the project
// already knew to be false.

/** What PostgREST may hand back for a to-one embedded relation. */
export type Embedded<T> = T | T[] | null | undefined

/**
 * The single row of a to-one embedded relation, however it arrived.
 *
 * The parameter is `unknown` because that is the truth: every Supabase
 * client here is built without a `Database` type, so a row's relations
 * are not typed and the type argument is an assertion, exactly as the
 * casts it replaces were. What changes is that the assertion sits in one
 * place with the array case handled, instead of in thirteen places with
 * the array case handled in six of them.
 */
export function one<T>(relation: unknown): T | null {
  if (!relation) return null
  if (Array.isArray(relation)) return (relation[0] ?? null) as T | null
  return relation as T
}

/**
 * Every row of a to-many embedded relation, however it arrived — the
 * mirror case, for a join that gives one object where the caller expects
 * a list. `?? []` alone gets this wrong in the other direction: it keeps
 * a bare object as a non-array and the caller's `.map` throws.
 */
export function many<T>(relation: unknown): T[] {
  if (!relation) return []
  return (Array.isArray(relation) ? relation : [relation]) as T[]
}
