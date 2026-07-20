// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRetrieve = vi.hoisted(() => vi.fn())
vi.mock("stripe", () => ({
  default: class MockStripe {
    paymentIntents = { retrieve: mockRetrieve }
  },
}))

import {
  verifyPledgePayment,
  PaymentVerificationError,
} from "@/lib/stripe-verify"

const GOOD_INTENT = {
  id: "pi_1",
  status: "succeeded",
  currency: "gbp",
  metadata: {
    favpoll_poll_id: "poll-1",
    pledge_amount: "10",
    tip_amount: "1",
    topup_amount: "0",
  },
}

const INPUT = {
  paymentIntentId: "pi_1",
  favpollPollId: "poll-1",
  totalAmount: 10,
  tipAmount: 1,
}

beforeEach(() => {
  mockRetrieve.mockReset()
  mockRetrieve.mockResolvedValue(GOOD_INTENT)
})

describe("verifyPledgePayment", () => {
  it("passes when the PI succeeded and the amounts match", async () => {
    await expect(verifyPledgePayment(INPUT)).resolves.toBeUndefined()
    expect(mockRetrieve).toHaveBeenCalledWith("pi_1")
  })

  it("rejects an empty payment reference without calling Stripe", async () => {
    await expect(
      verifyPledgePayment({ ...INPUT, paymentIntentId: "" })
    ).rejects.toThrow("Missing payment reference")
    expect(mockRetrieve).not.toHaveBeenCalled()
  })

  it("rejects when the PI cannot be retrieved", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("No such payment_intent"))
    await expect(verifyPledgePayment(INPUT)).rejects.toThrow(
      "Payment not found"
    )
  })

  it("rejects a PI that has not succeeded", async () => {
    mockRetrieve.mockResolvedValueOnce({
      ...GOOD_INTENT,
      status: "requires_payment_method",
    })
    await expect(verifyPledgePayment(INPUT)).rejects.toThrow(
      "Payment has not completed"
    )
  })

  it("rejects a non-GBP payment", async () => {
    mockRetrieve.mockResolvedValueOnce({ ...GOOD_INTENT, currency: "usd" })
    await expect(verifyPledgePayment(INPUT)).rejects.toThrow(
      "Unexpected payment currency"
    )
  })

  it("rejects a PI bound to a different poll", async () => {
    mockRetrieve.mockResolvedValueOnce({
      ...GOOD_INTENT,
      metadata: { ...GOOD_INTENT.metadata, favpoll_poll_id: "poll-2" },
    })
    await expect(verifyPledgePayment(INPUT)).rejects.toThrow("different poll")
  })

  it("rejects when the recorded pledge exceeds what was paid", async () => {
    await expect(
      verifyPledgePayment({ ...INPUT, totalAmount: 100 })
    ).rejects.toThrow("Pledge amount does not match")
  })

  it("rejects when the recorded tip does not match what was paid", async () => {
    await expect(
      verifyPledgePayment({ ...INPUT, tipAmount: 0 })
    ).rejects.toThrow("Contribution amount does not match")
  })

  it("rejects a PI with no amount metadata (foreign PaymentIntent)", async () => {
    mockRetrieve.mockResolvedValueOnce({
      ...GOOD_INTENT,
      metadata: { favpoll_poll_id: "poll-1" },
    })
    await expect(verifyPledgePayment(INPUT)).rejects.toThrow(
      "Pledge amount does not match"
    )
  })

  it("throws PaymentVerificationError instances", async () => {
    mockRetrieve.mockResolvedValueOnce({ ...GOOD_INTENT, status: "canceled" })
    await expect(verifyPledgePayment(INPUT)).rejects.toBeInstanceOf(
      PaymentVerificationError
    )
  })
})
