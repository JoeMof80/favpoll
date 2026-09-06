// SUPERSEDED 2026-09-06 (founder): the guest no longer pays the card
// fee — processing is absorbed at settlement, the JustGiving posture.
// The 2026-08-27 guest-pays decision (kept below for the record) held
// "100% of your pledge reaches the charity" literally true; the founder
// consciously retired that claim estate-wide today in exchange for a
// calmer checkout (total = pledge + tip, no creep). The charity's
// remittance is pledge minus its processing share, computed at
// settlement with the helpers below — which is why this module stays.
//
// (2026-08-27, superseded) The card fee the GUEST pays, so the charity
// receives the pledge whole and favpoll never pays for someone else's
// favpoll. Putting it on the guest kept "100% of your pledge goes to
// charity" literally true. Favpoll earned nothing from it.

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
