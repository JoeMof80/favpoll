import Stripe from "stripe"

// Server-side payment truth for pledges (2026-07-20). Historically the
// pledge actions recorded whatever amount the client claimed, never touching
// Stripe — so a pledge could be recorded without paying, and the recorded
// amount was client-supplied. Now:
//
//  - /api/stripe/payment-intent computes the charge SERVER-side from its
//    parts (pledge + tip + top-up) and stamps the parts into PI metadata.
//  - createPledge / createGuestPledge call verifyPledgePayment before
//    recording anything: the PI must exist, have succeeded, be in GBP, be
//    bound to the same poll, and its metadata parts must equal the amounts
//    being recorded. The recorded pledge therefore always matches money
//    that actually moved.
//  - pledges.payment_intent_id (partial unique index) makes each payment
//    recordable exactly once.
//
// Shared-fund pledges (pledgeFromFund) charge no card and skip this.

let stripeClient: Stripe | null = null
function stripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return stripeClient
}

export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PaymentVerificationError"
  }
}

type VerifyInput = {
  paymentIntentId: string
  /** The poll the pledge is being recorded against */
  favpollPollId: string
  /** Pounds — the charity amount being recorded as pledges.total_amount */
  totalAmount: number
  /** Pounds — the optional contribution being recorded as pledges.tip_amount */
  tipAmount: number
}

/**
 * Throws PaymentVerificationError unless the PaymentIntent proves the
 * amounts being recorded were genuinely charged for this poll.
 */
export async function verifyPledgePayment({
  paymentIntentId,
  favpollPollId,
  totalAmount,
  tipAmount,
}: VerifyInput): Promise<void> {
  if (!paymentIntentId) {
    throw new PaymentVerificationError("Missing payment reference")
  }

  let intent: Stripe.PaymentIntent
  try {
    intent = await stripe().paymentIntents.retrieve(paymentIntentId)
  } catch {
    throw new PaymentVerificationError("Payment not found")
  }

  if (intent.status !== "succeeded") {
    throw new PaymentVerificationError("Payment has not completed")
  }
  if (intent.currency !== "gbp") {
    throw new PaymentVerificationError("Unexpected payment currency")
  }
  if (intent.metadata.favpoll_poll_id !== favpollPollId) {
    throw new PaymentVerificationError("Payment is for a different poll")
  }

  const paidPledge = Number(intent.metadata.pledge_amount)
  const paidTip = Number(intent.metadata.tip_amount)
  if (!Number.isFinite(paidPledge) || paidPledge !== totalAmount) {
    throw new PaymentVerificationError(
      "Pledge amount does not match the payment"
    )
  }
  if (!Number.isFinite(paidTip) || paidTip !== tipAmount) {
    throw new PaymentVerificationError(
      "Contribution amount does not match the payment"
    )
  }
}
