// The charity CONSENT gate (founder go, 2026-09-07). Distinct from
// verification (is it a real registered charity?): consent records
// whether the charity has AGREED to appear and receive pledges — the
// PF/CP posture question (references/pfcp-instruction-letter-DRAFT-
// 2026-09-07.md). Enforcement rides CHARITY_CONSENT_POSTURE:
//   'open' (default, and when unset) — no gate, today's behaviour, and
//     crucially NO QUERY runs, so the code is inert until the posture
//     flips (safe to deploy before the consent DDL is applied).
//   'consent-first' — money is refused while any of a favpoll's
//     charities is unapproved.
// The legal opinion sets the default posture.

import type { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

export type ConsentPosture = "open" | "consent-first"

export function consentPosture(): ConsentPosture {
  return process.env.CHARITY_CONSENT_POSTURE === "consent-first"
    ? "consent-first"
    : "open"
}

type ConsentCharity = { name: string; consent_status?: string | null }

/** Charities that have not (yet) agreed — anything but 'approved'. */
export function unconsentedCharityNames(charities: ConsentCharity[]): string[] {
  return charities
    .filter((c) => c.consent_status !== "approved")
    .map((c) => c.name)
}

function throwIfUnconsentedNames(names: string[]): void {
  if (names.length === 0) return
  throw new Error(
    `Pledges open once ${names.join(" & ")} confirms — the charity hasn't yet agreed to receive them.`
  )
}

function throwIfUnconsented(charities: ConsentCharity[]): void {
  throwIfUnconsentedNames(unconsentedCharityNames(charities))
}

/* eslint-disable @typescript-eslint/no-explicit-any -- nested join shapes */

/** Gate by poll id (pledges — the parts all carry favpollPollId). */
export async function assertPledgeableCharitiesByPoll(
  supabase: AdminClient,
  favpollPollId: string
): Promise<void> {
  if (consentPosture() === "open") return
  const { data } = await supabase
    .from("favpoll_polls")
    .select("favpolls(favpoll_charities(charities(name, consent_status)))")
    .eq("id", favpollPollId)
    .single()
  const charities: ConsentCharity[] = (
    ((data as any)?.favpolls?.favpoll_charities ?? []) as any[]
  ).map((fc: any) => fc.charities)
  throwIfUnconsented(charities)
}

/** Names blocking a favpoll, for the UI — empty under the open posture
 * (no query runs). The public favpoll page uses this to withhold the
 * pledge CTA and show the quiet "opens once X confirms" notice instead. */
export async function unconsentedNamesByFavpoll(
  supabase: AdminClient,
  favpollId: string
): Promise<string[]> {
  if (consentPosture() === "open") return []
  const { data } = await supabase
    .from("favpolls")
    .select("favpoll_charities(charities(name, consent_status))")
    .eq("id", favpollId)
    .single()
  const charities: ConsentCharity[] = (
    ((data as any)?.favpoll_charities ?? []) as any[]
  ).map((fc: any) => fc.charities)
  return unconsentedCharityNames(charities)
}

/** Gate by favpoll id (fund top-ups carry favpollId, not a poll id). */
export async function assertPledgeableCharitiesByFavpoll(
  supabase: AdminClient,
  favpollId: string
): Promise<void> {
  throwIfUnconsentedNames(await unconsentedNamesByFavpoll(supabase, favpollId))
}
