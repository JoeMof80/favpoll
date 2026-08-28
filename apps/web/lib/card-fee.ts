// The card fee the GUEST pays, so the charity receives the pledge whole and
// favpoll never pays for someone else's favpoll.
//
// WHY IT EXISTS (founder, 2026-08-27). Two decisions had been travelling as
// one: "favpoll takes no platform fee" (real, decided 2026-07) and "favpoll
// absorbs the card processing cost" (never actually decided, but built and
// then written into the brand doc). They are separable — JustGiving has no
// platform fee either and still passes processing to the charity — and the
// second one meant a favpoll where nobody contributed cost favpoll ~£16 per
// £600 raised, with nothing coming back. That is a hole that scales with
// success.
//
// Putting it on the guest rather than the charity is what keeps "100% of your
// pledge goes to charity" literally true, which is the line that gets a
// charity to sign an agreement in an afternoon. It costs the guest about 50p
// on a £20 pledge.
//
// FAVPOLL EARNS NOTHING FROM THIS. Every penny goes to Stripe. The optional
// contribution remains favpoll's only income, and is now pure margin rather
// than something the business depends on to break even.

/**
 * Stripe UK standard pricing for domestic cards. EEA and international cards
 * cost more (2.5% / 3.25% at the time of writing); this deliberately charges
 * the domestic rate to everyone rather than penalising a guest for holding a
 * foreign card at a British funeral. The shortfall on those is favpoll's, and
 * is small against the contribution.
 */
export const CARD_FEE_RATE = 0.015
export const CARD_FEE_FIXED = 0.2

/**
 * The fee to add to `net` so that, after Stripe takes its cut of the LARGER
 * grossed-up charge, favpoll is left holding exactly `net`.
 *
 * The gross-up matters: naively adding 1.5% + 20p of the net leaves you short,
 * because Stripe then charges its percentage on the fee as well. Solving
 * gross = (net + fixed) / (1 - rate) is what actually closes.
 *
 * Rounded UP to the penny — a rounding that fell the other way would leave
 * favpoll a fraction short on every single pledge.
 */
export function cardFeeFor(net: number): number {
  if (!Number.isFinite(net) || net <= 0) return 0
  const gross = (net + CARD_FEE_FIXED) / (1 - CARD_FEE_RATE)
  return Math.ceil((gross - net) * 100) / 100
}

/** The total charged to the card: the parts, plus the fee that covers them. */
export function chargeWithCardFee(net: number): number {
  return Math.round((net + cardFeeFor(net)) * 100) / 100
}
