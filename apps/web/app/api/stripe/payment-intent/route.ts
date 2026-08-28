import Stripe from "stripe"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  isRateLimited,
  ipFromHeaders,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit"
import { cardFeeFor } from "@/lib/card-fee"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Sanity ceiling per charge part (pounds) — hostile-input guard, not a
// product limit.
const MAX_PART = 10_000

function part(value: unknown): number | null {
  if (value === undefined || value === null) return 0
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > MAX_PART) return null
  // Money arrives in pounds; forbid sub-penny fractions
  if (Math.round(n * 100) !== n * 100) return null
  return n
}

export async function POST(req: Request) {
  // Guests (userId === null) are allowed — the whole pledge-dialog flow supports
  // unauthenticated pledging. Email is captured at checkout and passed to the
  // savePledge call, which verifies this PaymentIntent server-side before
  // recording (lib/stripe-verify).
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

  // The charge is computed SERVER-side from its parts, and the parts are
  // stamped into the PaymentIntent metadata — savePledge later verifies the
  // recorded pledge/tip against them (lib/stripe-verify), so a client can
  // never record amounts it didn't pay.
  const body = (await req.json()) as {
    pledgeAmount?: unknown
    tipAmount?: unknown
    topUpAmount?: unknown
    favpollPollId?: unknown
    favpollId?: unknown
  }

  const pledgeAmount = part(body.pledgeAmount)
  const tipAmount = part(body.tipAmount)
  const topUpAmount = part(body.topUpAmount)

  if (pledgeAmount === null || tipAmount === null || topUpAmount === null) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  // THE CARD FEE IS COMPUTED HERE AND NOWHERE ELSE ON THE WIRE. It is
  // deliberately NOT a body field: a client that could name its own fee could
  // name zero, and the charge would silently stop covering itself. The client
  // computes the same number from the same helper only to DISPLAY it.
  const net = Math.round((pledgeAmount + tipAmount + topUpAmount) * 100) / 100
  const feeAmount = cardFeeFor(net)

  const totalPence = Math.round((net + feeAmount) * 100)
  if (totalPence <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const favpollPollId =
    typeof body.favpollPollId === "string" ? body.favpollPollId : null
  const favpollId = typeof body.favpollId === "string" ? body.favpollId : null

  // A pledge charge must be bound to its poll so the PaymentIntent can only
  // ever record a pledge there. Fund-only top-ups carry a favpoll instead.
  if (pledgeAmount > 0 && !favpollPollId) {
    return NextResponse.json({ error: "Missing poll" }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalPence,
    currency: "gbp",
    // Restrict to card only so the PaymentElement renders the card form
    // directly, bypassing Stripe's adaptive payment-method selector.
    // "card" deliberately includes Apple Pay / Google Pay — they are
    // wallets riding on the card type, shown by PaymentElement once the
    // domain is registered with Stripe (public/.well-known/, see
    // references/wallet-payments-scope-2026-07.md). Keeping the explicit
    // pin excludes Link/Klarna-style redirect methods (no return_url
    // handling in the dialog flow). Headless/E2E still get the plain
    // card form.
    payment_method_types: ["card"],
    metadata: {
      ...(userId ? { clerk_user_id: userId } : {}),
      ...(favpollPollId ? { favpoll_poll_id: favpollPollId } : {}),
      ...(favpollId ? { favpoll_id: favpollId } : {}),
      pledge_amount: String(pledgeAmount),
      tip_amount: String(tipAmount),
      topup_amount: String(topUpAmount),
      // Recorded for reconciliation only. verifyPledgePayment checks the
      // PARTS, not the PaymentIntent total, so the fee riding along cannot
      // affect what a pledge is allowed to record.
      fee_amount: String(feeAmount),
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  })
}
