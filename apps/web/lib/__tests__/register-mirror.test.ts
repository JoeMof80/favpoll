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
