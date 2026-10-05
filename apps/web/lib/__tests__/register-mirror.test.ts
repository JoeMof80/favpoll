import { describe, it, expect, vi } from "vitest"

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }))

import { placeFromAddress, verificationFromRow } from "../register-mirror"

describe("the register mirror", () => {
  it("reads Town, County from the joined address and never the postcode", () => {
    expect(placeFromAddress("17 Wakley Street, London, EC1V 7QE")).toBe(
      "Wakley Street, London"
    )
    expect(
      placeFromAddress(
        "ST LUKES HOSPICE, GRANGE ROAD, WINSFORD, CHESHIRE, CW7 2PB"
      )
    ).toBe("Winsford, Cheshire")
    expect(placeFromAddress(null)).toBeNull()
    expect(placeFromAddress("SW1A 1AA")).toBeNull()
  })

  // The mirror took over verification in September with its own copy of
  // the name comparison, which turned punctuation into a SPACE — so
  // "BARNARDO'S" read as "barnardo s" against our "barnardos" and a
  // charity that verified against the API came back a name mismatch.
  // One comparison now, shared with charity-commission.
  it("treats punctuation inside a name as nothing, as the API does", () => {
    for (const [register, ours] of [
      ["BARNARDO'S", "Barnardos"],
      ["BARNARDO’S", "Barnardos"], // the curly one too
      ["ST. MUNGO'S", "St Mungos"],
      ["WWF-UK", "WWF UK"],
    ] as const) {
      expect(
        verificationFromRow(
          { name: register, status: "Registered", removed_on: null },
          ours
        ).status
      ).toBe("verified")
    }
  })

  it("still calls a genuinely different legal name a mismatch", () => {
    for (const [register, ours] of [
      ["CHARITY PROJECTS", "Comic Relief"],
      ["THE BRITISH DIABETIC ASSOCIATION", "Diabetes UK"],
      ["CHURCH OF ENGLAND CHILDREN'S SOCIETY", "Children's Society"],
    ] as const) {
      expect(
        verificationFromRow(
          { name: register, status: "Registered", removed_on: null },
          ours
        ).status
      ).toBe("name_mismatch")
    }
  })

  it("verifies from a row the way the API would", () => {
    expect(
      verificationFromRow(
        { name: "DOGS TRUST", status: "Registered", removed_on: null },
        "Dogs Trust"
      )
    ).toEqual({ status: "verified", registeredName: "DOGS TRUST" })
    expect(
      verificationFromRow(
        { name: "DOGS TRUST LEGACY", status: "Registered", removed_on: null },
        "Dogs Trust"
      )
    ).toEqual({ status: "name_mismatch", registeredName: "DOGS TRUST LEGACY" })
    expect(
      verificationFromRow(
        { name: "GONE", status: "Removed", removed_on: "2020-01-01" },
        "Gone"
      )
    ).toEqual({ status: "removed", registeredName: "GONE" })
  })
})
