import { createAdminClient } from "@/lib/supabase/admin"
import {
  fetchRegisterContact,
  fetchRegisterPurpose,
  searchRegisterRanked,
  normaliseName,
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

/** The verification the API would give, from a mirror row — plus the
 *  OTHER NAMES the register publishes for that number (2026-10-05).
 *
 *  A charity's display name is ours: our case, our apostrophes, our
 *  accents (the register holds MEDECINS SANS FRONTIERES where we hold
 *  Médecins Sans Frontières). But it must be ACCOUNTABLE to the
 *  register, and the register knows more names than the legal one —
 *  COMIC RELIEF for CHARITY PROJECTS, NSPCC, RNLI, MIND, "R S P C A".
 *  Matching the legal name alone left 17 of 42 account charities reading
 *  as a name mismatch, which silently costs them the verified tick.
 *
 *  `registeredName` stays the LEGAL name whatever matched: it is the
 *  identity we show beside the number, and what Gift Aid needs. */
export function verificationFromRow(
  row: Pick<MirrorRow, "name" | "status" | "removed_on">,
  ourName: string,
  otherNames: string[] = []
): CharityVerification {
  if (row.status !== "Registered" || row.removed_on) {
    return { status: "removed", registeredName: row.name }
  }
  const ours = normaliseName(ourName)
  const known = [row.name, ...otherNames].some((n) => normaliseName(n) === ours)
  if (!known) {
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

/** Every name the register knows for a number: working and previous,
 *  from register_charity_names (migration 20261005120000). */
export async function otherNamesFor(
  registeredNumber: string
): Promise<string[]> {
  const digits = registeredNumber.replace(/\D/g, "")
  if (!digits) return []
  const { data, error } = await createAdminClient()
    .from("register_charity_names")
    .select("name")
    .eq("registered_number", Number(digits))
  if (error) {
    console.error("[register-mirror] other names unreadable:", error.message)
    return []
  }
  return ((data ?? []) as { name: string }[]).map((r) => r.name)
}

/** Verify against the mirror; the API only when the mirror has no row.
 *  (The API path cannot see the other names — it returns the legal name
 *  alone — so it stays stricter. It is only reached for a charity the
 *  mirror has not got.) */
export async function verifyOnMirror(
  registeredNumber: string,
  ourName: string
): Promise<CharityVerification> {
  const [row, otherNames] = await Promise.all([
    rowByNumber(registeredNumber),
    otherNamesFor(registeredNumber),
  ])
  if (row) return verificationFromRow(row, ourName, otherNames)
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

/** THE REGISTER'S OWN CONTACT AND PURPOSE for a set of numbers, in one
 *  query, keyed by the number as text (step 4 of
 *  references/charity-profiles-2026-09-27.md: read from the mirror
 *  instead of the copies on `charities`, which step 5 drops).
 *
 *  No API fallback here, unlike the single-row readers: a list of
 *  charities is not worth a round trip per miss, and a charity registered
 *  since the extract simply shows nothing until the next load. */
export async function mirrorContactAndPurpose(
  numbers: (string | null | undefined)[]
): Promise<Map<string, MirrorRow>> {
  const digits = [
    ...new Set(
      numbers
        .map((n) => (n ?? "").replace(/\D/g, ""))
        .filter((n) => n.length > 0)
    ),
  ].map(Number)
  if (digits.length === 0) return new Map()
  const { data, error } = await createAdminClient()
    .from("register_charities")
    .select(
      "registered_number, name, status, latest_income, address, postcode, email, website, activities, objects, classification, areas, removed_on"
    )
    .in("registered_number", digits)
  if (error) {
    console.error("[register-mirror] list read failed:", error.message)
    return new Map()
  }
  return new Map(
    (data as MirrorRow[]).map((row) => [String(row.registered_number), row])
  )
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

/** The mirror with the place-aware retry ("st lukes winsford"), and
 *  nothing else: the route runs this alongside its rate-limit check and
 *  goes to the API only for a request it has decided to serve. */
export async function searchMirrorWithPlaceRetry(
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
  return { results: [], total: 0 }
}

/** The Commission's API in the mirror's shape — for what the mirror lacks. */
export async function searchApiAsMirror(
  q: string,
  cap = 20
): Promise<{ results: MirrorSearchResult[]; total: number }> {
  const api = await searchRegisterRanked(q, cap)
  return {
    total: api.total,
    results: api.results.map((r) => ({ ...r, place: null, website: null })),
  }
}

/** The picker's search: the mirror first, with the place-aware retry,
 *  then the API for anything the mirror lacks. */
export async function searchRegisterMirrorFirst(
  q: string,
  cap = 20
): Promise<{ results: MirrorSearchResult[]; total: number }> {
  const mirror = await searchMirrorWithPlaceRetry(q, cap)
  if (mirror.results.length > 0) return mirror
  return searchApiAsMirror(q, cap)
}
