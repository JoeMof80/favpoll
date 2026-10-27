// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockAuth = vi.hoisted(() => vi.fn())
const mockIsRateLimited = vi.hoisted(() => vi.fn())
const mockSearchMirror = vi.hoisted(() => vi.fn())
const mockSearchApi = vi.hoisted(() => vi.fn())

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("@/lib/register-mirror", () => ({
  searchMirrorWithPlaceRetry: mockSearchMirror,
  searchApiAsMirror: mockSearchApi,
}))
vi.mock("@/lib/rate-limit", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/rate-limit")>()
  return { ...actual, isRateLimited: mockIsRateLimited }
})

import { GET } from "../route"

const HIT = {
  results: [
    { registeredNumber: "515595", displayName: "St Luke's Cheshire Hospice" },
  ],
  total: 1,
}

const search = (q = "St Luke", ip = "203.0.113.7") =>
  new Request(
    `https://favpoll.com/api/charities/register-search?q=${encodeURIComponent(q)}`,
    { headers: { "x-forwarded-for": ip } }
  )

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ userId: null })
  mockIsRateLimited.mockResolvedValue(false)
  mockSearchMirror.mockResolvedValue(HIT)
  mockSearchApi.mockResolvedValue({ results: [], total: 0 })
})

describe("register search — who may search", () => {
  // THE DEFECT THIS FIXES (founder, 2026-10-27). The wizard runs signed
  // out, and this route did not: a hospice typing its own name into the
  // charity step was told no registered charity matched it.
  it("answers a visitor with no account", async () => {
    const res = await GET(search())

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(HIT)
  })

  it("meters a visitor by address, on a bucket of their own", async () => {
    await GET(search())

    expect(mockIsRateLimited).toHaveBeenCalledWith(
      "register-search-anon-ip",
      "203.0.113.7",
      expect.arrayContaining([
        expect.objectContaining({ name: "1h", max: 200 }),
      ])
    )
  })

  it("meters an organiser by account, so one busy office is not one visitor", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" })

    await GET(search())

    expect(mockIsRateLimited).toHaveBeenCalledWith(
      "register-search",
      "user-1",
      expect.any(Array)
    )
  })

  it("refuses once the bucket is empty", async () => {
    mockIsRateLimited.mockResolvedValue(true)

    const res = await GET(search())

    expect(res.status).toBe(429)
  })
})
