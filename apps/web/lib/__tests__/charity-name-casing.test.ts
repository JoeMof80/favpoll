import { describe, it, expect } from "vitest"
import { titleCaseCharityName } from "@/lib/charity-commission"

// WEB'S COPY, TESTED. apps/web/lib/charity-commission.ts and its admin twin
// hold the same casing rules, and until now only admin's copy was covered —
// which is exactly how they drifted in September: verification moved to the
// mirror carrying its OWN copy of normaliseName that replaced punctuation
// with a space, so "barnardo s" failed to match "barnardos" and Barnardos
// came back a name mismatch. One untested copy is one copy free to rot.
//
// This file guards the twin at the point the public site uses it: the legal
// name under a charity's own name (#1020) runs through here.
describe("titleCaseCharityName (web's copy)", () => {
  it("matches the admin twin on the ordinary rules", () => {
    expect(titleCaseCharityName("HOSPICE UK")).toBe("Hospice UK")
    expect(titleCaseCharityName("NSPCC")).toBe("NSPCC")
    expect(titleCaseCharityName("FRIENDS OF THE EARTH")).toBe(
      "Friends of the Earth"
    )
    expect(titleCaseCharityName("ST JOHN AMBULANCE")).toBe("St John Ambulance")
    expect(titleCaseCharityName("128TH OLDHAM SCOUT GROUP")).toBe(
      "128th Oldham Scout Group"
    )
    expect(titleCaseCharityName("'CHESTNUTS' PRE-SCHOOL")).toBe(
      "'Chestnuts' Pre-School"
    )
  })

  // FIXED 2026-10-15 in both copies. The [a-z] character classes mangled any
  // accented name three ways at once: the word matcher split "frontières"
  // into "fronti" and "res", the first ASCII letter AFTER an accent took the
  // capital, and an accented first letter never took one at all — so
  // "Médecins Sans Frontières" rendered as "MéDecins Sans FrontièRes". The
  // register publishes unaccented names, but our stored display names do not,
  // and this function renders them on the public charity page.
  it("handles accented letters", () => {
    expect(titleCaseCharityName("MÉDECINS SANS FRONTIÈRES")).toBe(
      "Médecins Sans Frontières"
    )
    expect(titleCaseCharityName("Médecins Sans Frontières")).toBe(
      "Médecins Sans Frontières"
    )
    expect(titleCaseCharityName("école française")).toBe("École Française")
    expect(titleCaseCharityName("ÅLAND TRUST")).toBe("Åland Trust")
    expect(titleCaseCharityName("naïve hope")).toBe("Naïve Hope")
    expect(titleCaseCharityName("YNYS MÔN TRUST")).toBe("Ynys Môn Trust")
  })
})
