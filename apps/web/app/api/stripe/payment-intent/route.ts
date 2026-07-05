import Stripe from "stripe"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  isRateLimited,
  ipFromHeaders,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  // Guests (userId === null) are allowed — the whole pledge-dialog flow supports
  // unauthenticated pledging. Email is captured at checkout and passed to the
  // webhook-driven savePledge call.
  const { userId } = await auth()

  // Payment-intent creation is the card-testing surface. Generous per-IP
  // so a whole venue can pledge (30/min, 200/hour) but hostile to a bot
  // cycling stolen cards. Signed-in users are keyed by id, not IP.
  const limiterId = userId ?? ipFromHeaders(req.headers)
  const limited = await isRateLimited("payment-intent", limiterId, [
    { name: "1m", max: 30, windowSeconds: 60 },
    { name: "1h", max: 200, windowSeconds: 3600 },
  ])
  if (limited) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const { amount, metadata } = (await req.json()) as {
    amount: number
    metadata?: Record<string, string>
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // pence
    currency: "gbp",
    // Restrict to card only so the PaymentElement renders the card form
    // directly, bypassing Stripe's adaptive payment-method selector.
    // Apple Pay / Google Pay require additional domain verification and
    // are not supported in E2E or headless environments.
    payment_method_types: ["card"],
    metadata: { ...(userId ? { clerk_user_id: userId } : {}), ...metadata },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
