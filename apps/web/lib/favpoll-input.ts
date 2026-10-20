import { z } from "zod"
import type { FavpollCategory, FavpollGrouping, Pronoun } from "@favpoll/types"
import { actionId } from "@/lib/action-input"

// THE FIELDS A FAVPOLL IS MADE OF, ONCE (#1109, 2026-10-20).
//
// Creation (app/favpolls/new) and editing (app/favpolls/[id]/edit) write
// the same columns from two differently-shaped arguments —
// `CreateFavpollInput` and `CanvasSubmitData`. Two schemas describing the
// same columns would drift, which is the thing this ticket is about, so
// the field definitions live here and each path composes the shape it
// actually receives.
//
// The reasoning behind the loose ends is in lib/action-input.ts: these
// bound the shape, which only a crafted request or a bug gets wrong, and
// leave anything an honest organiser could get wrong to the form that
// collected it and to the action's own guards.

export const ID_MESSAGE = "That favpoll, topic or charity wasn't recognised."
export const id = actionId(ID_MESSAGE)

export const TOO_LONG = "That's longer than we can store."

/** One line, collapsed and bounded. The form caps these far lower
 *  (components/favpoll-form/schema.ts); this is the outer wall. */
export const text = (max: number, message: string) =>
  z
    .string(message)
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .refine((s) => s.length <= max, message)

/** A paragraph: newlines survive, only the length is bounded. */
export const prose = (max: number, message: string) =>
  z.string(message).max(max, message)

export const grouping = z.enum(
  ["individual", "couple", "group"],
  "That isn't a grouping we know."
)
export const pronoun = z.enum(
  ["he", "she", "they", "i"],
  "That isn't a pronoun we know."
)
export const subject = z.enum(
  ["someone", "cause"],
  "A favpoll is either about someone or about a cause."
)
export const category = z.enum(
  ["celebration", "memorial", "fundraiser"],
  "That isn't a category we know."
)

// The enums mirror @favpoll/types both ways; tsc enforces it. Add a
// Pronoun to the shared package without adding it here and this stops
// compiling.
type SameSet<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never
const _grouping: SameSet<z.infer<typeof grouping>, FavpollGrouping> = true
const _pronoun: SameSet<z.infer<typeof pronoun>, Pronoun> = true
const _category: SameSet<z.infer<typeof category>, FavpollCategory> = true
void _grouping
void _pronoun
void _category

export const TOO_MANY_OPTIONS =
  "That's more options than one favpoll can carry."
export const OPTION_TOO_LONG = "One of those options is too long."

/** Hand-typed option labels. A subset's members arrive through the same
 *  field, so the ceiling clears any real catalogue; it exists because the
 *  validators walk the whole array. */
export const optionLabels = z
  .array(text(200, OPTION_TOO_LONG))
  .max(500, TOO_MANY_OPTIONS)

export const canonicalItemIds = z
  .array(id)
  .max(1000, "That's too many options.")

export const infiniteItems = z
  .object({ canonicalItemIds, customLabels: optionLabels })
  .nullable()

/** The client sends `date.toISOString()`. Before this, a string `Date`
 *  could not read reached `new Date(...).toISOString()` and threw a
 *  RangeError the organiser saw as a generic failure. */
export const closesAt = z.iso.datetime({
  offset: true,
  error: "That closing date didn't make sense.",
})

export const money = (what: string) => {
  const message = `That ${what} isn't a number we can take.`
  return z.number(message).nonnegative(message).nullable()
}

/**
 * The scalars both paths share. `protagonistName` has no minimum: a cause
 * favpoll sends "", and which of the two names is required is a rule about
 * the SUBJECT, which each action still states in its own words.
 */
export const favpollScalars = {
  protagonistName: text(200, "That name is too long."),
  protagonistAbout: prose(2000, TOO_LONG).nullable(),
  photoUrl: text(2000, "That photo link is too long.").nullable(),
  dateLabel: text(200, TOO_LONG).nullable(),
  causeLabel: text(200, "That cause name is too long.").nullable(),
  pronoun: pronoun.nullable().optional(),
  openingLine: text(200, TOO_LONG).nullable(),
  description: prose(2000, TOO_LONG).nullable(),
  charityIds: z.array(id).max(3, "A favpoll can name at most three charities."),
  closesAt,
  isPrivate: z.boolean("Say whether the favpoll is private."),
  isListed: z.boolean("Say whether the favpoll is listed."),
  allowGuestItems: z.boolean("Say whether guests may add options."),
  showGuestAmounts: z
    .boolean("Say whether guest amounts are shown.")
    .optional(),
  goalAmount: money("goal").optional(),
  /**
   * MONEY, AND AS PERMISSIVE AS IT WAS. This writes
   * `favpoll_pots.total_deposited` directly and every caller sends null. A
   * nonnegative, finite bound is a strict improvement — a negative or a
   * NaN would corrupt the pot — but whether a non-zero value should be
   * refused outright is a ledger decision, raised rather than taken.
   */
  potAmount: money("amount"),
}
