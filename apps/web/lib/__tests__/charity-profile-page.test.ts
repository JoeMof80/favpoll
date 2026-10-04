import { describe, it, expect } from "vitest"
import { profileKeyFromParam } from "@/lib/charity-profile-page"

// The route uses this to tell a registered number from an account's uuid,
// so both answers matter: a wrong "yes" sends a real charity page down the
// register path, and a wrong "no" 404s a page that exists.
describe("profileKeyFromParam", () => {
  it("takes a plain registered number", () => {
    expect(profileKeyFromParam("1089464")).toBe("1089464")
    expect(profileKeyFromParam(" 207076 ")).toBe("207076")
    // Eight digits: the register has one (19262026), and nothing should
    // assume six or seven.
    expect(profileKeyFromParam("19262026")).toBe("19262026")
  })

  it("keeps a linked charity's suffix — it is a different charity", () => {
    expect(profileKeyFromParam("1089464-1")).toBe("1089464-1")
  })

  it("takes the standard identifiers", () => {
    expect(profileKeyFromParam("GB-CHC-1089464")).toBe("1089464")
    expect(profileKeyFromParam("GB-SC-SC003558")).toBe("SC003558")
    expect(profileKeyFromParam("GB-NIC-100000")).toBe("NIC100000")
    expect(profileKeyFromParam("sc003558")).toBe("SC003558")
  })

  it("says no to anything that is not a number", () => {
    for (const p of [
      "7a3b9c11-0000-4000-8000-000000000000", // an account's uuid
      "st-lukes-hospice",
      "",
      "12345", // too short to be a registered number
      "scope",
    ]) {
      expect(profileKeyFromParam(p)).toBeNull()
    }
  })
})
