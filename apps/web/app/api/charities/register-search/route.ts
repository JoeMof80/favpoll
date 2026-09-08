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
  const q = new URL(req.url).searchParams.get("q") ?? ""
  const { results, total } = await searchRegisterRanked(q)
  const enriched = await Promise.all(
    results.map(async (r) => ({
      ...r,
      ...(await rowContact(r.registeredNumber)),
    }))
  )
  return NextResponse.json({ results: enriched, total })
}
