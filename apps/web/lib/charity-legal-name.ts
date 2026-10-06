import { normaliseName, titleCaseCharityName } from "@/lib/charity-commission"

// THE LEGAL NAME UNDER THE BRAND NAME (step 4 of the verification work,
// 2026-10-05).
//
// An account's name is the name the charity is KNOWN by — Comic Relief,
// RNLI, the National Trust. The register knows them by their legal name,
// and that is the name the registered number can be checked against:
// 326568 is CHARITY PROJECTS, 209603 is THE ROYAL NATIONAL LIFEBOAT
// INSTITUTION. A reader holding the number and the brand name alone
// cannot reconcile the two, so the page shows both.
//
// Only when they DIFFER. "Registered charity 1014851 · Hospice UK" under
// a heading that says Hospice UK is noise, and the comparison that
// decides it is normaliseName — the same one answer to "is this the same
// charity name" the tick uses, so leading "The", trailing "Limited",
// punctuation and case never count as a difference.

/** The register's legal name, title-cased for reading, or null when it is
 *  the same name we already show. */
export function legalNameToShow(
  ourName: string,
  registeredName: string | null
): string | null {
  if (!registeredName?.trim()) return null
  if (normaliseName(registeredName) === normaliseName(ourName)) return null
  return titleCaseCharityName(registeredName)
}
