import type { DisbursementProvider } from "./provider"
import { NoopDisbursementProvider } from "./noop-provider"

export * from "./provider"
export { NoopDisbursementProvider } from "./noop-provider"
export { splitEqually } from "./split"

// The active disbursement rail. A no-op until a real provider (Goodstack,
// pending onboarding) is wired in — swap this one line to go live.
export const disbursementProvider: DisbursementProvider =
  new NoopDisbursementProvider()
