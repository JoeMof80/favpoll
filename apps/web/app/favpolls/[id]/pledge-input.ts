import { z } from "zod"

// THE SHAPE OF EVERY ARGUMENT THE MONEY PATH TAKES (#1104, 2026-10-20).
//
// One declaration per action: the schema is the type (`z.input` below),
// so the two cannot drift. lib/action-input explains why a typed
// parameter is not a check, and why these schemas guard the shape and
// nothing more — by the time a pledge action runs the card has been
// charged, so a refusal costs somebody real money.
//
// Two things deliberately left loose, both because something downstream
// already does the job better:
//
//  - `paymentIntentId` is a plain string. An empty one is refused by
//    verifyPledgePayment with "Missing payment reference", which is the
//    existing contract and a better sentence than a schema would give.
//  - an id is `.min(1)`, not `.uuid()`. The query refuses a bad id on its
//    own, and a schema that got the id FORMAT wrong would refuse a real
//    pledge after the charge.

// A MESSAGE ON THE BASE TYPE, NOT JUST THE CHECK. zod answers a wrong
// TYPE before it runs any check, with its own sentence — so `z.number()`
// alone sent a guest "Invalid input: expected number, received string",
// and `.finite("…")` never fired, because z.number() rejects NaN and
// Infinity itself. Every constructor below therefore carries the sentence
// as its first argument, and the checks override it where they have
// something more specific to say.

const NOT_A_NUMBER = "That amount isn't a number we can take."

const id = (what: string) =>
  z.string(`Missing the ${what}.`).min(1, `Missing the ${what}.`)

/** Pounds, as the client sends them. Positive is all we can insist on:
 *  the amount has already been charged and checked against the
 *  PaymentIntent, so a floor here would refuse a payment that happened.
 *  (z.number() rejects NaN and Infinity on its own.) */
const money = z.number(NOT_A_NUMBER).positive(NOT_A_NUMBER)

const optionalMoney = z
  .number(NOT_A_NUMBER)
  .nonnegative(NOT_A_NUMBER)
  .optional()

/** A pick and what it is worth. Zero is allowed because the actions
 *  filter the zeroes out — an unpicked favourite arrives as one. */
const allocation = z.object({
  favouriteId: id("favourite"),
  amount: z.number(NOT_A_NUMBER).nonnegative(NOT_A_NUMBER),
})

/** HMRC's claim-schedule minimum. Blank fields are refused by
 *  insertGiftAidDeclaration, which says what is missing; this only
 *  insists the four are strings. */
const giftAid = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    houseNameOrNumber: z.string(),
    postcode: z.string(),
  })
  .nullable()
  .optional()

/** Shared by both card paths: everything that is not identity. */
const cardPledgeFields = {
  favpollPollId: id("favpoll"),
  totalAmount: money,
  /** Optional contribution to favpoll (pounds) — never charity money */
  tipAmount: optionalMoney,
  /** Hide the name from the public guest book (organiser still sees it) */
  isAnonymous: z.boolean().optional(),
  /** Short guest book message (the action trims it to 100 characters
   *  rather than refusing one: the card is already charged) */
  message: z.string().nullable().optional(),
  /** Guest opted out of showing their donation amount */
  hideAmount: z.boolean().optional(),
  allocations: z.array(allocation),
  /** The Stripe PaymentIntent that charged this pledge */
  paymentIntentId: z.string(),
  /** Optional Gift Aid declaration — pledge amount only, never the tip */
  giftAid,
}

export const createPledgeSchema = z.object({
  ...cardPledgeFields,
  potAllocationId: z.string().nullable(),
})

export const createGuestPledgeSchema = z.object({
  ...cardPledgeFields,
  /** An address, not a format: a stricter check than the one the dialog
   *  made would refuse a guest whose card has already been taken. The
   *  action's own "Email is required" still covers the empty case. */
  guestEmail: z.string(),
  /** Name shown on the guest book; blank = appears as "Someone" */
  displayName: z.string().nullable().optional(),
})

export const pledgeFromFundSchema = z.object({
  favpollPollId: id("favpoll"),
  potId: id("shared pot"),
  totalAmount: money,
  isAnonymous: z.boolean().optional(),
  /** Short guest book message (100-char limit enforced client-side) */
  message: z.string().nullable().optional(),
  allocations: z.array(allocation),
})

/** The fund credits take their three arguments positionally, so the
 *  schema is a tuple. */
export const topUpFundSchema = z.tuple([
  id("favpoll"),
  money,
  z.string(), // PaymentIntent — verifyTopUpPayment refuses an empty one
])

/** The withdrawal link's form. The token is the only field, and the only
 *  authorisation (see the action). */
export const withdrawPledgeSchema = z.object({
  token: z.string(),
})

export type PledgeAllocationInput = z.input<typeof allocation>
export type GiftAidInput = NonNullable<z.input<typeof giftAid>>
export type CreatePledgeInput = z.input<typeof createPledgeSchema>
export type CreateGuestPledgeInput = z.input<typeof createGuestPledgeSchema>
export type PledgeFromFundInput = z.input<typeof pledgeFromFundSchema>
