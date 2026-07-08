// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

const mocks = vi.hoisted(() => ({
  sendContactMessage: vi.fn().mockResolvedValue(undefined),
  isRateLimited: vi.fn().mockResolvedValue(false),
}))

vi.mock("@/lib/email", () => ({
  sendContactMessage: mocks.sendContactMessage,
}))
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: mocks.isRateLimited,
  ipFromHeaders: () => "1.2.3.4",
  RATE_LIMIT_MESSAGE: "Too many requests — please try again in a few minutes.",
}))

import { POST } from "@/app/api/contact/route"

function req(body: unknown): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

const valid = {
  name: "Yusuf",
  email: "yusuf@example.com",
  role: "a charity",
  message: "How does favpoll work for us?",
}

beforeEach(() => {
  mocks.sendContactMessage.mockClear().mockResolvedValue(undefined)
  mocks.isRateLimited.mockReset().mockResolvedValue(false)
})

describe("POST /api/contact", () => {
  it("sends the message and returns ok for valid input", async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(mocks.sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Yusuf",
        email: "yusuf@example.com",
        role: "a charity",
        message: "How does favpoll work for us?",
      })
    )
  })

  it("returns 429 and does not send when rate limited", async () => {
    mocks.isRateLimited.mockResolvedValue(true)
    const res = await POST(req(valid))
    expect(res.status).toBe(429)
    expect(mocks.sendContactMessage).not.toHaveBeenCalled()
  })

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(req({ name: "", email: "", message: "" }))
    expect(res.status).toBe(400)
    expect(mocks.sendContactMessage).not.toHaveBeenCalled()
  })

  it("returns 400 for an invalid email", async () => {
    const res = await POST(req({ ...valid, email: "not-an-email" }))
    expect(res.status).toBe(400)
    expect(mocks.sendContactMessage).not.toHaveBeenCalled()
  })

  it("trims whitespace before sending", async () => {
    await POST(
      req({
        name: "  Yusuf  ",
        email: "  yusuf@example.com  ",
        role: "",
        message: "  hi  ",
      })
    )
    expect(mocks.sendContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Yusuf",
        email: "yusuf@example.com",
        message: "hi",
      })
    )
  })

  it("returns 500 when the email send fails", async () => {
    mocks.sendContactMessage.mockRejectedValueOnce(new Error("resend down"))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
  })
})
