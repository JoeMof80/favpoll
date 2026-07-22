import { describe, it, expect } from "vitest"
import { buildKeepsakeCsv, keepsakeCsvFilename } from "@/lib/keepsake-csv"

const BASE = {
  name: "Margaret Whitmore",
  topicTitle: "Biscuit",
  closedDate: "20 July 2026",
  totalRaised: 1300.71,
  charityNames: ["Dogs Trust", "RNLI"],
  standings: [
    { label: "Shortbread", amount: 463.55 },
    { label: 'Jaffa "Cake"', amount: 288.67 },
  ],
  guestNames: ["Trevor", "Ivy, the neighbour"],
}

describe("buildKeepsakeCsv", () => {
  it("includes summary, ranked standings, and named guests", () => {
    const csv = buildKeepsakeCsv(BASE)
    expect(csv).toContain("favpoll,Margaret Whitmore")
    expect(csv).toContain("Topic,Favourite Biscuit")
    expect(csv).toContain("Total raised (£),1300.71")
    expect(csv).toContain("Charities,Dogs Trust; RNLI")
    expect(csv).toContain("1,Shortbread,463.55")
    expect(csv).toContain("Guests")
    expect(csv).toContain("Trevor")
  })

  it("quotes commas and escapes embedded quotes", () => {
    const csv = buildKeepsakeCsv(BASE)
    expect(csv).toContain('2,"Jaffa ""Cake""",288.67')
    expect(csv).toContain('"Ivy, the neighbour"')
  })

  it("omits the guests section when nobody is named", () => {
    const csv = buildKeepsakeCsv({ ...BASE, guestNames: [] })
    expect(csv).not.toContain("Guests")
  })

  it("starts with a UTF-8 BOM for Excel", () => {
    expect(buildKeepsakeCsv(BASE).charCodeAt(0)).toBe(0xfeff)
  })
})

describe("keepsakeCsvFilename", () => {
  it("slugifies the name", () => {
    expect(keepsakeCsvFilename("Margaret Whitmore")).toBe(
      "favpoll-margaret-whitmore-results.csv"
    )
  })

  it("falls back when the name has no usable characters", () => {
    expect(keepsakeCsvFilename("——")).toBe("favpoll-favpoll-results.csv")
  })
})
