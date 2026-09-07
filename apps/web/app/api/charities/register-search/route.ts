import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { searchRegisterRanked } from "@/lib/charity-commission"
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

// The wizard's any-charity typeahead: proxies the Charity Commission
// register search (the API key never reaches the client). Signed-in
// only — the wizard is an organiser surface.
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
  return NextResponse.json({ results, total })
}
