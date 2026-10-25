"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

// RESETTING A TEST ENVIRONMENT (founder, 2026-10-25: "i have pledged against
// all the existing favpolls on staging so the state i need to inspect is no
// longer available. can we create a way to reseed or reset them?").
//
// IT WITHDRAWS, IT DOES NOT DELETE, and that is the whole safety argument.
// Entitlement, the standings and the note API all already ignore a withdrawn
// pledge:
//
//   app/favpolls/[id]/page.tsx   .eq("clerk_user_id", …).is("withdrawn_at", null)
//   lib/poll-standings.ts        .is("pledges.withdrawn_at", null)
//   app/api/polls/[id]/note      .is("withdrawn_at", null)
//
// So stamping `withdrawn_at` re-locks every favpoll, re-hides every note and
// takes the money back out of the totals, using a column the product already
// understands — and nulling it again puts everything back. Nothing is
// destroyed, which is what makes it tolerable to have in the admin app at
// all.
//
// NOT IN PRODUCTION, EVER. Marking a live pledge withdrawn without refunding
// it is a lie about somebody's money, so the refusal lives HERE rather than
// in the button: a hidden control is not a permission check (the same rule
// the consent gate follows). The residual hole is an admin run locally
// against production credentials, which no env check can see — the
// withdrawal-not-deletion design is what covers that case.

/** Vercel sets this on deployments; locally it is undefined, which is a
 *  developer machine and allowed. */
function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production"
}

export type ResetResult = {
  error: string | null
  /** How many pledges were stamped. */
  count: number
  /** The exact stamp, so the undo can find precisely these rows and leave
   *  genuine withdrawals alone. */
  at: string | null
}

/**
 * Withdraw every live pledge, across every favpoll — the "put staging back"
 * button. Returns the stamp it used so the caller can offer an undo.
 */
export async function withdrawAllPledges(): Promise<ResetResult> {
  if (isProduction()) {
    return {
      error: "Refused: this is production.",
      count: 0,
      at: null,
    }
  }

  const supabase = createAdminClient()
  const at = new Date().toISOString()

  const { data, error } = await supabase
    .from("pledges")
    .update({ withdrawn_at: at })
    .is("withdrawn_at", null)
    .select("id")

  if (error) return { error: error.message, count: 0, at: null }

  revalidatePath("/")
  revalidatePath("/favpolls")
  return { error: null, count: data?.length ?? 0, at }
}

/**
 * Undo one reset: nulls `withdrawn_at` on exactly the rows that reset
 * stamped. Matching on the timestamp rather than clearing the column wholesale
 * is what keeps a genuine withdrawal withdrawn.
 */
export async function restoreWithdrawnPledges(
  at: string
): Promise<ResetResult> {
  if (isProduction()) {
    return { error: "Refused: this is production.", count: 0, at: null }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pledges")
    .update({ withdrawn_at: null })
    .eq("withdrawn_at", at)
    .select("id")

  if (error) return { error: error.message, count: 0, at: null }

  revalidatePath("/")
  revalidatePath("/favpolls")
  return { error: null, count: data?.length ?? 0, at }
}

// ── E2E débris ──────────────────────────────────────────────────────────────
//
// The e2e teardown UNLISTS rather than deletes, deliberately: the wizard specs
// assert listing behaviour during a run, and the comment there argues for
// keeping the rows as an evidence trail. Nobody ever decided when to stop
// keeping it, so by 2026-10-25 staging held 199 of them against one real
// favpoll (founder: "all of the favpolls in the admin are E2E tests except
// Michael Mensah"... "none of them are worth keeping").
//
// A favpoll is E2E if its cause_label or its protagonist's name begins "E2E"
// — the same two shapes the teardown sweeps, because the wizard specs publish
// one of each.
//
// THIS ONE REALLY DELETES, and the row cascades to its polls, pledges and
// guest-book entries. That is the point here and it is why the production
// refusal matters more than it does for the withdrawal above.

async function e2eFavpollIds(
  supabase: ReturnType<typeof createAdminClient>
): Promise<string[]> {
  const [{ data: byCause }, { data: protagonists }] = await Promise.all([
    supabase.from("favpolls").select("id").like("cause_label", "E2E%"),
    supabase.from("protagonists").select("id").like("name", "E2E%"),
  ])

  const ids = new Set((byCause ?? []).map((r: { id: string }) => r.id))

  const protagonistIds = (protagonists ?? []).map((p: { id: string }) => p.id)
  if (protagonistIds.length > 0) {
    const { data: byProtagonist } = await supabase
      .from("favpolls")
      .select("id")
      .in("protagonist_id", protagonistIds)
    for (const r of byProtagonist ?? []) ids.add((r as { id: string }).id)
  }

  return [...ids]
}

/** How many E2E favpolls are on the platform — for the button's label, so it
 *  never offers to delete nothing. */
export async function countE2eFavpolls(): Promise<number> {
  if (isProduction()) return 0
  return (await e2eFavpollIds(createAdminClient())).length
}

/** Delete every E2E favpoll. Cascades. Not reversible. */
export async function deleteE2eFavpolls(): Promise<{
  error: string | null
  count: number
}> {
  if (isProduction()) {
    return { error: "Refused: this is production.", count: 0 }
  }

  const supabase = createAdminClient()
  const ids = await e2eFavpollIds(supabase)
  if (ids.length === 0) return { error: null, count: 0 }

  // In chunks: a 199-item `in` list is fine, a few thousand is not.
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await supabase
      .from("favpolls")
      .delete()
      .in("id", ids.slice(i, i + 100))
    if (error) return { error: error.message, count: i }
  }

  revalidatePath("/")
  revalidatePath("/favpolls")
  return { error: null, count: ids.length }
}
