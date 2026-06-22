import Stripe from "stripe"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  // Guests (userId === null) are allowed — the whole pledge-dialog flow supports
  // unauthenticated pledging. Email is captured at checkout and passed to the
  // webhook-driven savePledge call.
  const { userId } = await auth()

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
    automatic_payment_methods: { enabled: true },
    metadata: { ...(userId ? { clerk_user_id: userId } : {}), ...metadata },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
