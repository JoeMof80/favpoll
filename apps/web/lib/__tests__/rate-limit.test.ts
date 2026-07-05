// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockRpc = vi.hoisted(() => vi.fn())
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: mockRpc }),
}))

import { isRateLimited, ipFromHeaders } from "../rate-limit"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("ipFromHeaders", () => {
  it("takes the first hop of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })
    expect(ipFromHeaders(h)).toBe("1.2.3.4")
  })

  it("falls back to 'unknown' without the header", () => {
    expect(ipFromHeaders(new Headers())).toBe("unknown")
  })
})

describe("isRateLimited", () => {
  it("returns false when all rules are within limit", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null })

    const limited = await isRateLimited("payment-intent", "ip-1", [
      { name: "1m", max: 30, windowSeconds: 60 },
      { name: "1h", max: 200, windowSeconds: 3600 },
    ])

    expect(limited).toBe(false)
    expect(mockRpc).toHaveBeenCalledTimes(2)
    expect(mockRpc).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "payment-intent:1m:ip-1",
      p_max: 30,
      p_window_seconds: 60,
    })
  })

  it("returns true and short-circuits when a rule is exceeded", async () => {
    mockRpc.mockResolvedValueOnce({ data: false, error: null })

    const limited = await isRateLimited("payment-intent", "ip-1", [
      { name: "1m", max: 30, windowSeconds: 60 },
      { name: "1h", max: 200, windowSeconds: 3600 },
    ])

    expect(limited).toBe(true)
    expect(mockRpc).toHaveBeenCalledTimes(1) // second rule not checked
  })

  it("fails open when the rpc errors", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "db down" } })

    const limited = await isRateLimited("payment-intent", "ip-1", [
      { name: "1m", max: 30, windowSeconds: 60 },
    ])

    expect(limited).toBe(false)
  })

  it("fails open when the rpc throws", async () => {
    mockRpc.mockRejectedValue(new Error("network"))

    const limited = await isRateLimited("payment-intent", "ip-1", [
      { name: "1m", max: 30, windowSeconds: 60 },
    ])

    expect(limited).toBe(false)
  })
})
