// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ id: "email-1" }))
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

import {
  sendPledgeConfirmation,
  sendFavpollClosed,
  sendGuestItemAdded,
  sendExtensionRequest,
} from "../email"
import { escapeHtml, renderEmail } from "../email-template"

beforeEach(() => {
  mockSend.mockClear()
})

function lastHtml(): string {
  return mockSend.mock.calls.at(-1)![0].html
}

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<img src=x onerror="pwn('&')">`)).toBe(
      "&lt;img src=x onerror=&quot;pwn(&#39;&amp;&#39;)&quot;&gt;"
    )
  })
})

describe("renderEmail", () => {
  it("wraps content in the branded layout", () => {
    const html = renderEmail({
      heading: "The poll has closed.",
      bodyHtml: "<p>body</p>",
      cta: { label: "See the final rankings", url: "https://example.com" },
    })
    expect(html).toContain("fav<span")
    expect(html).toContain("The poll has closed.")
    expect(html).toContain("See the final rankings")
    expect(html).toContain(
      "Expressions of joy, for charitable causes, in the name of those we love."
    )
  })

  it("escapes the CTA label and preheader", () => {
    const html = renderEmail({
      preheader: "<b>peek</b>",
      heading: "h",
      bodyHtml: "",
      cta: { label: "<script>", url: "https://example.com" },
    })
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("<b>peek</b>")
  })
})

describe("sendPledgeConfirmation", () => {
  const params = {
    to: "guest@example.com",
    protagonistName: "Belinda",
    charityNames: ["Age UK", "RNLI"],
    amount: 10,
    closesAt: "2026-08-01T00:00:00Z",
    guestToken: "tok-123",
    favpollId: "fav-1",
  }

  it("sends the branded confirmation with the no-platform-fee line and ordinal date", async () => {
    await sendPledgeConfirmation(params)

    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe("guest@example.com")
    expect(call.subject).toBe("Your pledge for Belinda")
    expect(call.html).toContain("Thank you.")
    expect(call.html).toContain("Age UK &amp; RNLI")
    expect(call.html).toContain("favpoll takes no platform fee")
    expect(call.html).toContain("1st August 2026")
    expect(call.html).toContain("/favpolls/fav-1")
    expect(call.html).toContain("/pledges/withdraw?token=tok-123")
  })

  it("escapes a hostile protagonist name", async () => {
    await sendPledgeConfirmation({
      ...params,
      protagonistName: `<img src=x>`,
    })
    expect(lastHtml()).not.toContain("<img src=x>")
    expect(lastHtml()).toContain("&lt;img src=x&gt;")
  })
})

describe("sendFavpollClosed", () => {
  it("includes the total and the results CTA", async () => {
    await sendFavpollClosed({
      to: "organiser@example.com",
      protagonistName: "Belinda",
      totalRaised: 340,
      favpollId: "fav-1",
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.subject).toBe("Your favpoll for Belinda has closed")
    expect(call.html).toContain("£340.00")
    expect(call.html).toContain("See the final rankings")
    // memorial-adjacent copy carries no exclamation marks
    expect(call.html).toContain(
      "a small, lasting record from a day that mattered."
    )
  })
})

describe("sendGuestItemAdded", () => {
  it("escapes the guest-supplied label", async () => {
    await sendGuestItemAdded({
      to: "organiser@example.com",
      itemLabel: `<script>alert(1)</script>`,
      topicTitle: "Ice cream",
      openingLine: "In memory of",
      protagonistName: "Belinda",
      favpollId: "fav-1",
    })

    expect(lastHtml()).not.toContain("<script>alert(1)</script>")
    expect(lastHtml()).toContain("&lt;script&gt;")
  })
})

describe("sendExtensionRequest", () => {
  it("escapes the organiser message and preserves line breaks", async () => {
    await sendExtensionRequest({
      organizerEmail: "org@example.com",
      organizerName: "Jo <b>",
      favpollId: "fav-1",
      message: "line one\n<script>",
    })

    const html = lastHtml()
    expect(html).toContain("Jo &lt;b&gt;")
    expect(html).toContain("line one<br>&lt;script&gt;")
  })
})
