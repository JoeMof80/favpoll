import type {
  DisbursementProvider,
  DisbursementRequest,
  DisbursementResult,
} from "./provider"

// Records the *intent* to disburse without moving any money. Keeps the
// close-favpoll pipeline runnable and the ledger populated until a real
// provider (Goodstack, pending onboarding) is wired in. Everything is marked
// 'pending' so it is unambiguous that nothing has actually reached a charity
// yet.
export class NoopDisbursementProvider implements DisbursementProvider {
  readonly name = "noop"

  async disburse(req: DisbursementRequest): Promise<DisbursementResult> {
    return { status: "pending", providerRef: `noop:${req.reference}` }
  }
}
