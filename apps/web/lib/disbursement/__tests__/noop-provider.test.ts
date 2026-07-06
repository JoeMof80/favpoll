import { describe, it, expect } from "vitest"
import { NoopDisbursementProvider } from "@/lib/disbursement/noop-provider"

describe("NoopDisbursementProvider", () => {
  const provider = new NoopDisbursementProvider()

  it("identifies itself as 'noop'", () => {
    expect(provider.name).toBe("noop")
  })

  it("records intent as 'pending' without moving money, keyed to the reference", async () => {
    const result = await provider.disburse({
      favpollId: "fp-1",
      charityId: "ch-1",
      registeredNumber: "1234567",
      amount: 30,
      reference: "fp-1:ch-1",
    })
    expect(result).toEqual({
      status: "pending",
      providerRef: "noop:fp-1:ch-1",
    })
  })
})
