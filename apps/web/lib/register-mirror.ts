import { createAdminClient } from "@/lib/supabase/admin"
import {
  fetchRegisterContact,
  fetchRegisterPurpose,
  searchRegisterRanked,
  titleCaseCharityName,
  verifyCharityNumber,
  type CharityVerification,
  type RegisterContact,
  type RegisterPurpose,
  type RegisterSearch,
  type RegisterClassification,
  type RegisterArea,
} from "@/lib/charity-commission"

// THE REGISTER MIRROR as the source for search, verification, contact and
// purpose (founder, 2026-09-27): `register_charities` holds every
// Commission charity, refreshed from the bulk extract by
// scripts/register/load-register.ts. The live API stays as the freshness
// fallback — a charity registered since the extract, or a mirror that is
// empty on a fresh environment — never the first call.

export type MirrorRow = {
  registered_number: number
  name: string
  status: string
  latest_income: number | null
  address: string | null
  postcode: string | null
  email: string | null
  website: string | null
  activities: string | null
  objects: string | null
  classification: RegisterClassification | null
  areas: { type: string; description: string }[] | null
  removed_on: string | null
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/** "Town, County" from the register's joined address, title-cased: the
 *  last two parts, the postcode never being one of them. */
export function placeFromAddress(address: string | null): string | null {
  if (!address) return null
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .map((p) => p.replace(/^\d+[a-z]?\s+/i, "")) // a house number is not a place
    .filter((p) => p && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(p))
  if (parts.length === 0) return null
  return parts
    .slice(-2)
    .map((p) =>
      p
        .toLowerCase()
        .replace(
          /(^|[\s-])([a-z])/g,
          (_m, a: string, b: string) => a + b.toUpperCase()
        )
    )
    .join(", ")
}

/** The verification the API would give, from a mirror row. */
export function verificationFromRow(
  row: Pick<MirrorRow, "name" | "status" | "removed_on">,
  ourName: string
): CharityVerification {
  if (row.status !== "Registered" || row.removed_on) {
    return { status: "removed", registeredName: row.name }
  }
  if (norm(row.name) !== norm(ourName)) {
    return { status: "name_mismatch", registeredName: row.name }
  }
  return { status: "verified", registeredName: row.name }
}

async function rowByNumber(
  registeredNumber: string
): Promise<MirrorRow | null> {
  const digits = registeredNumber.replace(/\D/g, "")
  if (!digits) return null
  const { data } = await createAdminClient()
    .from("register_charities")
    .select(
      "registered_number, name, status, latest_income, address, postcode, email, website, activities, objects, classification, areas, removed_on"
    )
    .eq("registered_number", Number(digits))
    .maybeSingle()
  return (data as MirrorRow | null) ?? null
}

/** Verify against the mirror; the API only when the mirror has no row. */
export async function verifyOnMirror(
  registeredNumber: string,
  ourName: string
): Promise<CharityVerification> {
  const row = await rowByNumber(registeredNumber)
  if (row) return verificationFromRow(row, ourName)
  return verifyCharityNumber(registeredNumber, ourName)
}

/** Contact details from the mirror; the API when it has no row. */
export async function contactFromMirror(
  registeredNumber: string
): Promise<RegisterContact> {
  const row = await rowByNumber(registeredNumber)
  if (!row) return fetchRegisterContact(registeredNumber)
  return {
    email: row.email,
    website: row.website,
    registeredName: row.name,
    place: placeFromAddress(row.address),
  }
}

/** Purpose from the mirror; the API when it has no row. The extract has
 *  no grant-making flag, so it is read from the How classification:
 *  a charity that only makes grants is a grant-maker. */
export async function purposeFromMirror(
  registeredNumber: string
): Promise<RegisterPurpose> {
  const row = await rowByNumber(registeredNumber)
  if (!row) return fetchRegisterPurpose(registeredNumber)
  const how = row.classification?.how ?? []
  const grantMaking =
    how.length === 0 ? null : how.every((h) => /grant/i.test(h))
  return {
    activities: row.activities,
    classification: row.classification,
    objects: row.objects,
    areas: (row.areas ?? []).map(
      (a): RegisterArea => ({ area: a.description, type: a.type })
    ),
    grantMaking,
  }
}

export type MirrorSearchResult = RegisterSearch["results"][number] & {
  place: string | null
  website: string | null
}

/** Substring search over the mirror's punctuation-stripped name key
 *  ("st lukes" finds ST LUKE'S), ranked whole > prefix > word start >
 *  anywhere, income as the tie-break; place-filtered when a place is
 *  given. Empty when the mirror has nothing (the caller falls back to
 *  the API, which is also where typos go). */
export async function searchMirror(
  q: string,
  cap = 20,
  place: string | null = null
): Promise<{ results: MirrorSearchResult[]; total: number }> {
  const query = q.trim()
  if (query.length < 2) return { results: [], total: 0 }
  const supabase = createAdminClient()
  const [{ data, error }, { data: total }] = await Promise.all([
    supabase.rpc("search_register", { q: query, place, lim: cap }),
    place
      ? Promise.resolve({ data: null })
      : supabase.rpc("count_register", { q: query }),
  ])
  if (error) {
    console.error("[register-mirror] search failed:", error.message)
    return { results: [], total: 0 }
  }
  const rows = (data ?? []) as {
    registered_number: number
    name: string
    address: string | null
    website: string | null
  }[]
  return {
    total: typeof total === "number" ? total : rows.length,
    results: rows.map((r) => ({
      registeredNumber: String(r.registered_number),
      registeredName: r.name,
      displayName: titleCaseCharityName(r.name),
      place: placeFromAddress(r.address),
      website: r.website,
    })),
  }
}

/** The picker's search: the mirror first, with the place-aware retry
 *  ("st lukes winsford"), then the API for anything the mirror lacks. */
export async function searchRegisterMirrorFirst(
  q: string,
  cap = 20
): Promise<{ results: MirrorSearchResult[]; total: number }> {
  const direct = await searchMirror(q, cap)
  if (direct.results.length > 0) return direct
  const words = q.trim().split(/\s+/).filter(Boolean)
  for (let k = words.length - 1; k >= 1; k--) {
    const base = words.slice(0, k).join(" ")
    if (base.length < 3) break
    const place = words.slice(k).join(" ")
    const hit = await searchMirror(base, cap, place)
    if (hit.results.length > 0) return hit
  }
  const api = await searchRegisterRanked(q, cap)
  return {
    total: api.total,
    results: api.results.map((r) => ({ ...r, place: null, website: null })),
  }
}
