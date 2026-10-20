// Stub for app/favpolls/[id]/actions — prevents Clerk server modules from
// being imported in the Storybook/Vitest browser environment.
//
// The money path returns an ActionResult (#1105), so these stubs must
// too: a bare undefined would make the caller's unwrap throw.
import type { ActionResult } from "@/lib/action-result"

const ok = <T>(value: T): ActionResult<T> => ({ ok: true, value })

export async function createPledge(): Promise<ActionResult<void>> {
  return ok(undefined)
}
export async function createGuestPledge(): Promise<ActionResult<string>> {
  return ok("")
}
export async function guestPledgeExists(): Promise<boolean> {
  return false
}
export async function guestPreflightState(): Promise<{
  hasAccount: boolean
  hasActivePledge: boolean
}> {
  return { hasAccount: false, hasActivePledge: false }
}
export async function addGuestItem(): Promise<void> {}
export async function addOrganizerItem(): Promise<void> {}
export async function pledgeFromFund(): Promise<ActionResult<void>> {
  return ok(undefined)
}
export async function topUpFund(): Promise<ActionResult<void>> {
  return ok(undefined)
}
export async function topUpFundAsGuest(): Promise<ActionResult<void>> {
  return ok(undefined)
}
