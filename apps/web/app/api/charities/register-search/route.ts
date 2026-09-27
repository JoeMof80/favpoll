import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { searchRegisterMirrorFirst } from "@/lib/register-mirror"
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

// The wizard's any-charity typeahead, over the REGISTER MIRROR
// (2026-09-27): substring-ranked in our own database, each row carrying the
// charity's place and website from the register (founder, 2026-09-08:
// names alone are ambiguous — many St Luke's), with the place-aware retry
// for "st lukes winsford" (founder, 2026-09-09) and the Commission's API
// only for what the mirror lacks. Signed-in only — an organiser surface.
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
  // 200, not 100: the founder hit the old clamp at "35 more" and every
  // further tap re-asked for the same window — stuck. The client detects
  // a clamped response (fewer rows than the window asked) and degrades
  // the More button to a keep-typing hint.
  const limit = Math.min(
    Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 20),
    200
  )
  const { results, total } = await searchRegisterMirrorFirst(q, limit)
  return NextResponse.json({ results, total })
}
