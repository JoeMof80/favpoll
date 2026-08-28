import { describe, it, expect } from "vitest"
import {
  cardFeeFor,
  chargeWithCardFee,
  CARD_FEE_RATE,
  CARD_FEE_FIXED,
} from "../card-fee"

/** What Stripe actually takes from a charge of `gross`. */
function stripeTakes(gross: number): number {
  return gross * CARD_FEE_RATE + CARD_FEE_FIXED
}

describe("cardFeeFor — the gross-up closes", () => {
  // THE POINT OF THE WHOLE FILE. Naively adding 1.5% + 20p of the NET leaves
  // favpoll short, because Stripe then charges its percentage on the fee too.
  // Every case here asserts the thing that actually matters: after Stripe has
  // taken its cut of the larger charge, what is left is at least the net.
  const cases = [1, 5, 10, 11, 15, 20, 22, 50, 53, 55, 100, 1000]

  it.each(cases)("nets at least £%d after Stripe's cut", (net) => {
    const gross = chargeWithCardFee(net)
    expect(gross - stripeTakes(gross)).toBeGreaterThanOrEqual(net)
  })

  it("a naive fee would NOT close — this is why the gross-up exists", () => {
    const net = 20
    const naive = net * CARD_FEE_RATE + CARD_FEE_FIXED
    const grossNaive = net + naive
    expect(grossNaive - stripeTakes(grossNaive)).toBeLessThan(net)
    expect(cardFeeFor(net)).toBeGreaterThan(naive)
  })

  it("never overshoots by more than a penny of rounding", () => {
    for (const net of cases) {
      const gross = chargeWithCardFee(net)
      expect(gross - stripeTakes(gross) - net).toBeLessThan(0.01)
    }
  })

  it("is a whole number of pence", () => {
    for (const net of cases) {
      expect(Math.round(cardFeeFor(net) * 100)).toBeCloseTo(
        cardFeeFor(net) * 100,
        6
      )
    }
  })

  it("is nothing when there is nothing to charge", () => {
    expect(cardFeeFor(0)).toBe(0)
    expect(cardFeeFor(-5)).toBe(0)
    expect(cardFeeFor(Number.NaN)).toBe(0)
  })

  it("costs about 50p on a typical £20 pledge", () => {
    // The number quoted to the founder, to charities and in the Fundraising
    // Regulator letter. If this changes, those change.
    expect(cardFeeFor(20)).toBeLessThanOrEqual(0.55)
    expect(cardFeeFor(20)).toBeGreaterThanOrEqual(0.45)
  })
})
