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

  // The register publishes WORKING names too (98,089 of them on the
  // mirror), and the brand name is usually one of them: COMIC RELIEF for
  // the legal CHARITY PROJECTS, NSPCC, RNLI, "R S P C A". A display name
  // the register knows is accounted for.
  it("accepts any name the register knows for that number", () => {
    const v = verificationFromRow(
      { name: "CHARITY PROJECTS", status: "Registered", removed_on: null },
      "Comic Relief",
      ["COMIC RELIEF", "SPORT RELIEF"]
    )
    expect(v.status).toBe("verified")
    // …and the LEGAL name is still what we report: it is the identity
    // shown beside the number, and what Gift Aid needs.
    expect(v.registeredName).toBe("CHARITY PROJECTS")
  })

  it("accepts a previous name, and a spaced-out acronym", () => {
    expect(
      verificationFromRow(
        {
          name: "MIND (THE NATIONAL ASSOCIATION FOR MENTAL HEALTH)",
          status: "Registered",
          removed_on: null,
        },
        "Mind",
        ["MIND"]
      ).status
    ).toBe("verified")
    expect(
      verificationFromRow(
        {
          name: "ROYAL SOCIETY FOR THE PREVENTION OF CRUELTY TO ANIMALS",
          status: "Registered",
          removed_on: null,
        },
        "RSPCA",
        ["R S P C A"]
      ).status
    ).toBe("verified")
  })

  // A leading "the" is not a different charity.
  it("ignores a leading the, as a word and not as letters", () => {
    expect(
      verificationFromRow(
        { name: "THE TRUSSELL TRUST", status: "Registered", removed_on: null },
        "Trussell Trust"
      ).status
    ).toBe("verified")
    // "Theatre" must not lose its first three letters — doing this after
    // the punctuation collapse turned "Theatre Royal" into "atreroyal".
    expect(
      verificationFromRow(
        { name: "THEATRE ROYAL BATH", status: "Registered", removed_on: null },
        "Theatre Royal"
      ).status
    ).toBe("name_mismatch")
  })

  // Accents fold rather than vanish, and a trailing legal form is not a
  // different charity. Both found on the real 62: the register holds
  // MEDECINS SANS FRONTIERES and RE-ENGAGE LTD.
  it("folds accents and ignores a trailing Ltd", () => {
    expect(
      verificationFromRow(
        {
          name: "MEDECINS SANS FRONTIERES",
          status: "Registered",
          removed_on: null,
        },
        "Médecins Sans Frontières"
      ).status
    ).toBe("verified")
    expect(
      verificationFromRow(
        { name: "RE-ENGAGE LTD", status: "Registered", removed_on: null },
        "Re-engage"
      ).status
    ).toBe("verified")
  })

  // …but a country qualifier is part of the brand, not a legal suffix.
  it("does not throw away a UK", () => {
    expect(
      verificationFromRow(
        { name: "DIABETES", status: "Registered", removed_on: null },
        "Diabetes UK"
      ).status
    ).toBe("name_mismatch")
  })

  it("a name the register has never known is still a mismatch", () => {
    expect(
      verificationFromRow(
        { name: "DOGS TRUST LEGACY", status: "Registered", removed_on: null },
        "Dogs Trust",
        ["DOGS TRUST LEGACY FUND"]
      ).status
    ).toBe("name_mismatch")
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
