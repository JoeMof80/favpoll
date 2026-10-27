import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  searchApiAsMirror,
  searchMirrorWithPlaceRetry,
} from "@/lib/register-mirror"
import {
  ipFromHeaders,
  isRateLimited,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit"
import { offRegisterNumber } from "@/lib/off-register"

// The wizard's any-charity typeahead, over the REGISTER MIRROR
// (2026-09-27): substring-ranked in our own database, each row carrying the
// charity's place and website from the register (founder, 2026-09-08:
// names alone are ambiguous — many St Luke's), with the place-aware retry
// for "st lukes winsford" (founder, 2026-09-09) and the Commission's API
// only for what the mirror lacks.
//
// OPEN TO EVERYONE SINCE 2026-10-27, because the wizard is. Signed out,
// the step showed only the consented shelf and answered everything else
// with "No registered charity matches" — a hospice typing its own name
// was told it did not exist. The session was never the abuse control
// here either: this reads our own mirror, and the rate limit is what
// protects it. A typeahead fires on every keystroke after a 200ms
// debounce, so the minute window has to allow real typing; the hour is
// the one that stops a script, since 20 a minute sustained is 1,200.
const ANON_SEARCH_LIMITS = [
  { name: "1m", max: 20, windowSeconds: 60 },
  { name: "1h", max: 200, windowSeconds: 3600 },
]

export async function GET(req: Request) {
  const { userId } = await auth()
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
  // The rate-limit check and the mirror search are both one round trip
  // to the database, so they go together (2026-09-27: the function sat
  // an ocean from the database and every sequential hop showed). A
  // limited request still pays for one cheap mirror query and nothing
  // more — the Commission's API is only asked for a request being served.
  const [limited, mirror] = await Promise.all([
    userId
      ? isRateLimited("register-search", userId, [
          { name: "1m", max: 20, windowSeconds: 60 },
        ])
      : isRateLimited(
          "register-search-anon-ip",
          ipFromHeaders(req.headers),
          ANON_SEARCH_LIMITS
        ),
    searchMirrorWithPlaceRetry(q, limit),
  ])
  if (limited) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }
  const { results, total } =
    mirror.results.length > 0 ? mirror : await searchApiAsMirror(q, limit)
  // THE DEMAND SIGNAL (profiles note §5). Scotland and Northern Ireland
  // are off the register favpoll mirrors, and the trigger to add one is
  // the first real request, not a date. The picker explains the boundary;
  // this is where it gets counted, so we know before anyone complains.
  const offRegister = results.length === 0 ? offRegisterNumber(q) : null
  if (offRegister) {
    console.log(`[off-register] ${offRegister} number searched: ${q}`)
  }
  return NextResponse.json({ results, total })
}
