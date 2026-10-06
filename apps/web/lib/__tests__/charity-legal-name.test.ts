import { describe, it, expect } from "vitest"
import { legalNameToShow } from "@/lib/charity-legal-name"

// Every pair here is a real production account (2026-10-05), which is the
// point: the rule has to earn its keep on the 42 names we actually have.
describe("legalNameToShow", () => {
  it("shows a legal name the brand name does not contain", () => {
    expect(legalNameToShow("Comic Relief", "CHARITY PROJECTS")).toBe(
      "Charity Projects"
    )
    expect(
      legalNameToShow("RNLI", "THE ROYAL NATIONAL LIFEBOAT INSTITUTION")
    ).toBe("The Royal National Lifeboat Institution")
    expect(
      legalNameToShow("Diabetes UK", "THE BRITISH DIABETIC ASSOCIATION")
    ).toBe("The British Diabetic Association")
    expect(legalNameToShow("WWF", "WWF - UK")).toBe("WWF - UK")
  })

  it("stays quiet when it is the same name", () => {
    expect(legalNameToShow("Hospice UK", "HOSPICE UK")).toBeNull()
    expect(legalNameToShow("Dogs Trust", "DOGS TRUST")).toBeNull()
  })

  // normaliseName is the one comparison, so the things it already treats
  // as the same name must not surface as a difference here either.
  it("does not count a leading The, an apostrophe or a Limited", () => {
    expect(legalNameToShow("Trussell Trust", "THE TRUSSELL TRUST")).toBeNull()
    expect(legalNameToShow("Barnardos", "BARNARDO'S")).toBeNull()
    expect(
      legalNameToShow(
        "Shelter National Campaign",
        "SHELTER NATIONAL CAMPAIGN LIMITED"
      )
    ).toBeNull()
  })

  it("stays quiet when there is no verified name to show", () => {
    expect(legalNameToShow("Nature Warriors", null)).toBeNull()
    expect(legalNameToShow("Nature Warriors", "   ")).toBeNull()
  })
})
