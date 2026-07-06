// The disbursement seam: favpoll's core decides *who gets how much*; a
// DisbursementProvider handles *moving the money* to a charity and reporting
// back. This boundary lets the concrete rail (Goodstack, pending onboarding)
// drop in later without touching the close-favpoll logic.
//
// Amounts are in pounds — favpoll stores money in pounds throughout; a real
// provider converts to minor units at its own API boundary (as the Stripe
// payment-intent already does).
//
// The interface is deliberately neutral on *when* funds move: `disburse` works
// whether the provider already holds the money (a hosted-payment model, where
// this is really an "allocate" instruction) or needs to remit it. That keeps
// the design safe until Goodstack's fund-ingestion model is confirmed.

export type DisbursementRequest = {
  favpollId: string
  charityId: string
  /** Charity Commission number, for providers that resolve charities by it. */
  registeredNumber: string | null
  /** Amount in pounds. */
  amount: number
  /** Idempotency key: `${favpollId}:${charityId}`. */
  reference: string
}

export type DisbursementStatus = "pending" | "sent" | "unpayable" | "failed"

export type DisbursementResult = {
  status: DisbursementStatus
  /** Provider's own reference for the payout, if any. */
  providerRef: string | null
  /** Populated for 'unpayable' / 'failed'. */
  reason?: string
}

export interface DisbursementProvider {
  /** Identifier stored on the ledger row (e.g. "noop", "goodstack"). */
  readonly name: string
  /** Move funds to one charity. Must be idempotent on `req.reference`. */
  disburse(req: DisbursementRequest): Promise<DisbursementResult>
}
