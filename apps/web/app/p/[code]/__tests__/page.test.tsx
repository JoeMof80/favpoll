// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

// next/navigation's redirect and notFound work by throwing; the real ones
// throw framework-internal errors, so we throw tagged ones we can assert on.
const REDIRECT = "NEXT_REDIRECT"
const NOT_FOUND = "NEXT_NOT_FOUND"
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const e = new Error(REDIRECT) as Error & { url?: string }
    e.url = url
    throw e
  },
  notFound: () => {
    throw new Error(NOT_FOUND)
  },
}))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

import ShortLinkPage from "@/app/p/[code]/page"

const CODE = "a1b2c3d4e5f6"
const ID = "3f8c1a2e-9b4d-4f6a-8c1e-2d5b7a9f0e13"

async function run(code: string) {
  try {
    await ShortLinkPage({ params: Promise.resolve({ code }) })
    return { outcome: "returned" as const }
  } catch (e) {
    const err = e as Error & { url?: string }
    return { outcome: err.message, url: err.url }
  }
}

beforeEach(() => {
  mock = makeSupabaseMock()
})

describe("/p/[code]", () => {
  it("resolves a known code to its favpoll", async () => {
    mock.queue({ id: ID })
    const r = await run(CODE)
    expect(r.outcome).toBe(REDIRECT)
    expect(r.url).toBe(`/favpolls/${ID}`)
  })

  it("looks the code up on short_code, not id", async () => {
    mock.queue({ id: ID })
    await run(CODE)
    const eq = mock.calls.find((c) => c.method === "eq")
    expect(eq?.args).toEqual(["short_code", CODE])
  })

  it("404s an unknown code", async () => {
    mock.queue(null)
    expect((await run(CODE)).outcome).toBe(NOT_FOUND)
  })

  // The shape guard runs BEFORE the query — probe traffic (/p/admin,
  // /p/../../etc) must never reach the database.
  it.each([
    ["too short", "a1b2c3"],
    ["too long", "a1b2c3d4e5f6a"],
    ["non-hex", "a1b2c3d4e5fg"],
    ["uppercase", "A1B2C3D4E5F6"],
    ["path traversal", "../../etc"],
  ])("404s a malformed code (%s) without querying", async (_label, code) => {
    const r = await run(code)
    expect(r.outcome).toBe(NOT_FOUND)
    expect(mock.calls).toHaveLength(0)
  })
})
