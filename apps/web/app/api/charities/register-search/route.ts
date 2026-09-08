import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  searchRegisterRanked,
  fetchRegisterContact,
} from "@/lib/charity-commission"
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

// The wizard's any-charity typeahead: proxies the Charity Commission
// register search (the API key never reaches the client). Signed-in
// only — the wizard is an organiser surface.
//
// ROW IDENTITY (founder, 2026-09-08): names alone are ambiguous — the
// register holds many St Luke's — so each result row also carries the
// charity's place and website from the details endpoint. That costs one
// details call per result, so hits are cached in-module; Fluid Compute
// reuses instances, which makes the cache worth having. The register
// email stays server-side.
const contactCache = new Map<
  string,
  { place: string | null; website: string | null; at: number }
>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

async function rowContact(registeredNumber: string) {
  const hit = contactCache.get(registeredNumber)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { place: hit.place, website: hit.website }
  }
  const { place, website } = await fetchRegisterContact(registeredNumber)
  if (contactCache.size > 500) contactCache.clear()
  contactCache.set(registeredNumber, { place, website, at: Date.now() })
  return { place, website }
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const limited = await isRateLimited("register-search", userId, [
    { name: "1m", max: 20, windowSeconds: 60 },
  ])
  if (limited) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }
  const url = new URL(req.url)
  const q = url.searchParams.get("q") ?? ""
  // The More row re-asks the SAME query with a wider window; enrichment
  // is cached per charity number, so growth only pays for the new rows.
  const limitRaw = parseInt(url.searchParams.get("limit") ?? "20", 10)
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 20),
    100
  )
  const { results, total } = await searchRegisterRanked(q, limit)

  // PLACE-AWARE FALLBACK (founder, 2026-09-09): what an organiser knows
  // is often the town — "st lukes winsford" — but the register matches
  // NAMES only, so that query draws a blank. Retry with trailing words
  // dropped and use them as a place filter over the enriched candidates.
  // Bounded (40 candidates) and cached; this path only runs where the
  // answer today is nothing at all.
  if (results.length === 0) {
    const words = q.trim().split(/\s+/).filter(Boolean)
    for (let k = words.length - 1; k >= 1; k--) {
      const base = words.slice(0, k).join(" ")
      if (base.length < 3) break
      const placeTerms = words.slice(k).map((w) => w.toLowerCase())
      const cand = await searchRegisterRanked(base, Math.max(40, limit))
      if (cand.results.length === 0) continue
      const enrichedCand = await Promise.all(
        cand.results.map(async (r) => ({
          ...r,
          ...(await rowContact(r.registeredNumber)),
        }))
      )
      const filtered = enrichedCand.filter((r) =>
        placeTerms.every((t) => (r.place ?? "").toLowerCase().includes(t))
      )
      if (filtered.length > 0) {
        return NextResponse.json({
          results: filtered.slice(0, limit),
          total: filtered.length,
        })
      }
    }
  }

  const enriched = await Promise.all(
    results.map(async (r) => ({
      ...r,
      ...(await rowContact(r.registeredNumber)),
    }))
  )
  return NextResponse.json({ results: enriched, total })
}
