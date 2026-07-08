import { sendContactMessage } from "@/lib/email"
import {
  isRateLimited,
  ipFromHeaders,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit"

// Public contact form (about page). Unauthenticated, so rate-limited by IP and
// capped in length — it sends an email, so it must not be floodable.
const MAX_FIELD = 200
const MAX_MESSAGE = 5000
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export async function POST(request: Request) {
  const ip = ipFromHeaders(request.headers)
  if (
    await isRateLimited("contact", ip, [
      { name: "10m", max: 5, windowSeconds: 600 },
      { name: "1d", max: 20, windowSeconds: 86400 },
    ])
  ) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const str = (v: unknown, cap: number) =>
    (typeof v === "string" ? v : "").trim().slice(0, cap)

  const name = str(body?.name, MAX_FIELD)
  const email = str(body?.email, MAX_FIELD)
  const role = str(body?.role, MAX_FIELD)
  const message = str(body?.message, MAX_MESSAGE)

  if (!name || !email || !message) {
    return Response.json(
      { error: "Please add your name, email, and a message." },
      { status: 400 }
    )
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    )
  }

  try {
    await sendContactMessage({ name, email, role, message })
  } catch (err) {
    console.error("[contact] send failed:", err)
    return Response.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    )
  }

  return Response.json({ ok: true })
}
