import { describe, it, expect } from "vitest"
import { htmlToText, eventLinks } from "../charity-events"

describe("reading a charity's website", () => {
  it("turns a page into plain text without scripts or tags", () => {
    const html = `<html><head><style>.x{}</style><script>var a=1</script></head>
<body><h1>Re-engage</h1><p>Our Sunday <b>tea parties</b> run every month.</p><!-- c --></body></html>`
    expect(htmlToText(html)).toBe(
      "Re-engage\nOur Sunday tea parties run every month."
    )
  })

  it("finds the site's own events and fundraising pages, and nothing off-site", () => {
    const base = new URL("https://www.reengage.org.uk/")
    const html = `<a href="/get-involved/fundraising">Fundraise</a>
<a href="https://reengage.org.uk/events?year=2026">Events</a>
<a href="https://www.justgiving.com/reengage/events">JustGiving</a>
<a href="/about-us">About</a>`
    expect(eventLinks(html, base)).toEqual([
      "https://www.reengage.org.uk/get-involved/fundraising",
      "https://reengage.org.uk/events",
    ])
  })
})
