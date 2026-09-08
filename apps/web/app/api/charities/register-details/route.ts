import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { fetchRegisterContact } from "@/lib/charity-commission"
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

// The picker's confirm step: identity details (register name, place,
// website) for ONE charity number, fetched on intent only — never per
// keystroke. Signed-in only; the register email stays server-side.
export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const limited = await isRateLimited("register-details", userId, [
    { name: "1m", max: 20, windowSeconds: 60 },
  ])
  if (limited) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }
  const number = new URL(req.url).searchParams.get("number") ?? ""
  if (!/^\d{5,8}$/.test(number)) {
    return NextResponse.json(
      { error: "Invalid charity number" },
      { status: 400 }
    )
  }
  const { registeredName, place, website } = await fetchRegisterContact(number)
  return NextResponse.json({ registeredName, place, website })
}
