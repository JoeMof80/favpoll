import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * WHAT LOCKS A PUBLISHED FAVPOLL, AND WHY (founder, 2026-09-23)
 *
 * The lock protects OTHER PEOPLE'S GIFTS — not the mere existence of money.
 * An organiser's own unspent top-up is their own gift to redirect; a guest's
 * is not. The previous rule locked everything the moment any money appeared,
 * which froze a favpoll with nothing but the organiser's own fiver in it, and
 * told them "guests have already pledged" when nobody had.
 *
 *   topic   — locked once anyone has PLEDGED, including a "give without
 *             picking" pledge (founder: those lock the topic too — the guest
 *             gave in the context of this topic, pick or no pick), and once
 *             the pot has been drawn on.
 *   charity — everything above, plus any top-up by someone OTHER than the
 *             organiser. Their money is committed to this charity.
 *   event   — follows charity: subject/grouping/category are the identity
 *             the giver gave to.
 *
 * NOTE for whoever adds Gift Aid to pot top-ups (founder wants this): a Gift
 * Aid declaration names a charity, so a Gift-Aided top-up must lock the
 * charity ABSOLUTELY — the organiser's own included, because they will have
 * declared to HMRC that this money goes to that charity. The forgiveness case
 * below then narrows to a non-Gift-Aided organiser top-up.
 */
export type FavpollLocks = {
  event: boolean
  charity: boolean
  topic: boolean
}

export type LockInputs = {
  pledgeCount: number
  /** Pot money already drawn on by a guest's pledge. */
  totalAllocated: number
  /** Top-ups paid for by anyone who is not the organiser — a signed-in
   *  other, or an anonymous guest (null clerk_user_id). */
  topUpsByOthers: number
}

export function favpollLocks(i: LockInputs): FavpollLocks {
  const spent = i.pledgeCount > 0 || i.totalAllocated > 0
  const charity = spent || i.topUpsByOthers > 0
  return { topic: spent, charity, event: charity }
}

/** The one reason string a locked step should show. */
export function lockReason(locks: FavpollLocks, step: "topic" | "charity") {
  if (step === "topic") return "Locked — guests have already pledged."
  return locks.topic
    ? "Locked — guests have already pledged."
    : // Nobody has pledged; someone else's money is sitting in the pot.
      "Locked — there's money in the shared pot."
}

/**
 * Gathers the three numbers from the database. Used by the edit page AND by
 * updateFavpoll, so the UI and the server cannot drift apart.
 */
export async function readLockInputs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  favpollId: string,
  pollId: string | null,
  createdBy: string | null
): Promise<LockInputs> {
  let pledgeCount = 0
  if (pollId) {
    const { count } = await supabase
      .from("pledges")
      .select("id", { count: "exact", head: true })
      .eq("favpoll_poll_id", pollId)
    pledgeCount = count ?? 0
  }

  const { data: pot } = await supabase
    .from("favpoll_pots")
    .select("id, total_allocated")
    .eq("favpoll_id", favpollId)
    .maybeSingle()

  let topUpsByOthers = 0
  if (pot?.id) {
    // Filtered in JS, not PostgREST: a null clerk_user_id (anonymous guest)
    // counts as "someone else", and `neq` does not match NULLs.
    const { data: topups } = await supabase
      .from("pot_topups")
      .select("clerk_user_id")
      .eq("pot_id", pot.id)
    topUpsByOthers = (topups ?? []).filter(
      (t: { clerk_user_id: string | null }) => t.clerk_user_id !== createdBy
    ).length
  }

  return {
    pledgeCount,
    totalAllocated: pot?.total_allocated ?? 0,
    topUpsByOthers,
  }
}
