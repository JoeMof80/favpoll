// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Supabase mock ──────────────────────────────────────────────────────────────
const mockFrom = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockUpdate = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: mockFrom }),
}))

// ── next/headers mock ──────────────────────────────────────────────────────────
const mockHeadersGet = vi.hoisted(() => vi.fn())
vi.mock("next/headers", () => ({
  headers: () => ({ get: mockHeadersGet }),
}))

// ── svix mock ─────────────────────────────────────────────────────────────────
const mockVerify = vi.hoisted(() => vi.fn())
const MockWebhook = vi.hoisted(() => vi.fn())
vi.mock("svix", () => ({
  Webhook: MockWebhook,
}))

import { POST } from "@/app/api/webhooks/clerk/route"

function makeRequest(body = "{}"): Request {
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body,
  })
}

function setSvixHeaders(present = true) {
  mockHeadersGet.mockImplementation((key: string) => {
    if (!present) return null
    const map: Record<string, string> = {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,sig123",
    }
    return map[key] ?? null
  })
}

function makeUserData(overrides: Record<string, any> = {}) {
  return {
    id: "clerk-user-1",
    email_addresses: [{ email_address: "user@example.com", id: "email-1" }],
    primary_email_address_id: "email-1",
    first_name: "Alice",
    last_name: "Smith",
    image_url: "https://example.com/avatar.jpg",
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CLERK_WEBHOOK_SECRET = "test-webhook-secret"
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co"
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key"

  // Restore Webhook constructor mock (cleared by clearAllMocks)
  // Must use function keyword — arrow functions cannot be used as constructors with `new`
  MockWebhook.mockImplementation(function () {
    return { verify: mockVerify }
  })
  // Default: valid signature returning a no-op event
  mockVerify.mockReturnValue({ type: "unknown", data: makeUserData() })

  setSvixHeaders(true)

  // Default from() chain: returns success for all operations
  const builder: any = {}
  builder.insert = mockInsert.mockReturnValue(Promise.resolve({ error: null }))
  builder.update = mockUpdate.mockReturnValue(builder)
  builder.delete = mockDelete.mockReturnValue(builder)
  builder.eq = mockEq.mockReturnValue(Promise.resolve({ error: null }))
  mockFrom.mockReturnValue(builder)
})

// ─────────────────────────────────────────────────────────────────────────────
// Config / header guards
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — guards", () => {
  it("returns 500 when CLERK_WEBHOOK_SECRET is not set", async () => {
    delete process.env.CLERK_WEBHOOK_SECRET

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })

  it("returns 400 when svix headers are missing", async () => {
    setSvixHeaders(false)

    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })

  it("returns 400 when svix signature verification fails", async () => {
    mockVerify.mockImplementationOnce(() => {
      throw new Error("bad sig")
    })

    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// user.created
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — user.created", () => {
  beforeEach(() => {
    mockVerify.mockReturnValue({ type: "user.created", data: makeUserData() })
  })

  it("returns 200 and inserts user with correct fields", async () => {
    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockFrom).toHaveBeenCalledWith("users")
    expect(mockInsert).toHaveBeenCalledWith({
      id: "clerk-user-1",
      email: "user@example.com",
      display_name: "Alice Smith",
      avatar_url: "https://example.com/avatar.jpg",
    })
  })

  it("sets email to null when primary_email_address_id is null", async () => {
    mockVerify.mockReturnValue({
      type: "user.created",
      data: makeUserData({ primary_email_address_id: null }),
    })

    await POST(makeRequest())

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: null })
    )
  })

  it("sets display_name to null when both first and last name are null", async () => {
    mockVerify.mockReturnValue({
      type: "user.created",
      data: makeUserData({ first_name: null, last_name: null }),
    })

    await POST(makeRequest())

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ display_name: null })
    )
  })

  it("returns 500 when insert fails", async () => {
    mockInsert.mockReturnValueOnce(
      Promise.resolve({ error: { message: "duplicate key" } })
    )

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// user.updated
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — user.updated", () => {
  beforeEach(() => {
    mockVerify.mockReturnValue({ type: "user.updated", data: makeUserData() })
  })

  it("returns 200 and updates user with correct fields", async () => {
    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockFrom).toHaveBeenCalledWith("users")
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        display_name: "Alice Smith",
        avatar_url: "https://example.com/avatar.jpg",
        updated_at: expect.any(String),
      })
    )
    expect(mockEq).toHaveBeenCalledWith("id", "clerk-user-1")
  })

  it("returns 500 when update fails", async () => {
    mockEq.mockReturnValueOnce(
      Promise.resolve({ error: { message: "row not found" } })
    )

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// user.deleted
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — user.deleted", () => {
  beforeEach(() => {
    mockVerify.mockReturnValue({ type: "user.deleted", data: makeUserData() })
  })

  it("returns 200 and deletes the user", async () => {
    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockFrom).toHaveBeenCalledWith("users")
    expect(mockDelete).toHaveBeenCalled()
    expect(mockEq).toHaveBeenCalledWith("id", "clerk-user-1")
  })

  it("returns 500 when delete fails", async () => {
    mockEq.mockReturnValueOnce(
      Promise.resolve({ error: { message: "constraint violation" } })
    )

    const res = await POST(makeRequest())
    expect(res.status).toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Unknown event type
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/clerk — unknown event type", () => {
  it("returns 200 without touching the database", async () => {
    mockVerify.mockReturnValue({
      type: "session.created",
      data: makeUserData(),
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
