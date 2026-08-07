# The disbursement-provider seam

_Split out of `goodstack-call-brief-2026-07.md` on 7 August 2026 — it is
engineering design, not call material, and it was the bulk of a document
meant to be read in the five minutes before a meeting._

A thin, partner-agnostic boundary: favpoll's core computes _who gets how much_;
a provider handles _resolve + move money_. Goodstack becomes the first real
implementation; a no-op keeps the pipeline runnable until the demo unlocks
their SDK.

The interface (money in pounds, matching the rest of favpoll; pence only at a
real provider's API boundary):

```ts
export type DisbursementRequest = {
  favpollId: string
  charityId: string
  registeredNumber: string | null // Charity Commission no.
  amount: number // pounds
  reference: string // idempotency key: `${favpollId}:${charityId}`
}

export type DisbursementResult = {
  status: "pending" | "sent" | "unpayable" | "failed"
  providerRef: string | null
  reason?: string
}

export interface DisbursementProvider {
  readonly name: string
  disburse(req: DisbursementRequest): Promise<DisbursementResult>
}
```

**How it slots in:** in `close-favpolls`, after a favpoll is closed, load its
charities, split `total_raised` equally (≤3 charities, equal split), call the
provider per charity, and record every attempt in a new **`disbursements`
ledger table**. The active provider is a **no-op** that marks everything
`pending` — so the ledger is populated and it's unambiguous that no money has
actually moved yet.

**Two deliberate choices:**

- The interface is **neutral on _when_ money moves** — `disburse` works whether
  Goodstack already holds the funds (hosted-payment model → really an
  "allocate" instruction) or needs a remittance. This protects the design from
  the fund-ingestion unknown until the demo answers it.
- **Gift Aid is not on this interface.** Declaration capture is a pledge-time
  concern, and _who claims_ depends on the demo. Keeping it off the seam avoids
  baking in an assumption we can't yet confirm.

**Build now vs hold:** building the seam + no-op provider + `disbursements`
ledger + cron wiring now is low-regret — it retires the do-nothing gap and
gives a real ledger whatever the demo decides. The `GoodstackProvider` impl and
the Gift-Aid claim path wait for the call.

The ledger also feeds the future "transactions ledger → shared-fund tips" work,
so it pays double.

**Note the shape this creates, which matters commercially:** guests pledge
individually, but money leaves **once per charity when a favpoll closes** — so
1–3 grants per favpoll, not one per pledge. Cheap under per-grant pricing,
expensive under per-donation pricing. See the call brief.
