import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Stripe webhook — the reconciliation half of payment truth. Verification
// at save time (#301/#303) stops fabricated records; this records every
// succeeded PaymentIntent so the reconcile-payments cron can notice a
// payment nothing ever recorded (client died after confirmPayment) — the
// charged-but-unrecorded window becomes visible instead of silent.
//
// Ops: create the endpoint in the Stripe dashboard pointing at
// /api/webhooks/stripe with the payment_intent.succeeded event, and set
// STRIPE_WEBHOOK_SECRET in the environment. Until then the route answers
// 503 (and Stripe retries, harmlessly).

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error(
      "[webhooks/stripe] STRIPE_WEBHOOK_SECRET not set — event dropped"
    )
    return NextResponse.json(
      { error: "Webhook not configured" },
      {
        status: 503,
      }
    )
  }

  const signature = req.headers.get("stripe-signature")
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", secret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent
    const supabase = createAdminClient()

    // Idempotent: Stripe retries deliveries; the unique payment_intent_id
    // makes replays a no-op.
    const { error } = await supabase.from("stripe_payment_events").upsert(
      {
        payment_intent_id: intent.id,
        amount_pence: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata ?? {},
      },
      { onConflict: "payment_intent_id", ignoreDuplicates: true }
    )

    if (error) {
      // Non-200 → Stripe retries later; better than losing the event
      console.error("[webhooks/stripe] event write failed:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
