"use server"

import { auth } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import {
  isRateLimited,
  ipFromHeaders,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendPledgeConfirmation, sendGuestItemAdded } from "@/lib/email"
import { verifyPledgePayment, verifyTopUpPayment } from "@/lib/stripe-verify"

type PledgeAllocationInput = {
  favouriteId: string
  amount: number
}

// A card pledge is recorded only after its PaymentIntent is verified against
// Stripe (status succeeded, bound to this poll, amounts matching what was
// actually charged — lib/stripe-verify). The PI id is stored so each payment
// can be recorded exactly once (partial unique index is the backstop).
async function assertUnusedPaymentIntent(
  supabase: ReturnType<typeof createAdminClient>,
  paymentIntentId: string
) {
  const { data: existing } = await supabase
    .from("pledges")
    .select("id")
    .eq("payment_intent_id", paymentIntentId)
    .maybeSingle()
  if (existing) {
    throw new Error("This payment has already been recorded.")
  }
}

type CreatePledgeInput = {
  favpollPollId: string
  potAllocationId: string | null
  totalAmount: number
  /** Optional contribution to favpoll (pounds) — never charity money */
  tipAmount?: number
  /** Hide the name from the public guest wall (organiser still sees it) */
  isAnonymous?: boolean
  allocations: PledgeAllocationInput[]
  /** The Stripe PaymentIntent that charged this pledge */
  paymentIntentId: string
}

export async function createPledge(input: CreatePledgeInput) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  await verifyPledgePayment({
    paymentIntentId: input.paymentIntentId,
    favpollPollId: input.favpollPollId,
    totalAmount: input.totalAmount,
    tipAmount: input.tipAmount ?? 0,
  })

  const supabase = createAdminClient()
  await assertUnusedPaymentIntent(supabase, input.paymentIntentId)

  const { data: pledge, error: pledgeErr } = await supabase
    .from("pledges")
    .insert({
      favpoll_poll_id: input.favpollPollId,
      clerk_user_id: userId,
      pot_allocation_id: input.potAllocationId,
      total_amount: input.totalAmount,
      fee: 0,
      tip_amount: input.tipAmount ?? 0,
      is_anonymous: input.isAnonymous ?? false,
      payment_intent_id: input.paymentIntentId,
    })
    .select("id")
    .single()

  if (pledgeErr || !pledge)
    throw new Error(pledgeErr?.message ?? "Failed to create pledge")

  const { error: allocErr } = await supabase.from("pledge_allocations").insert(
    input.allocations
      .filter((a) => a.amount > 0)
      .map((a) => ({
        pledge_id: pledge.id,
        favourite_id: a.favouriteId,
        amount: a.amount,
      }))
  )

  if (allocErr) throw new Error(allocErr.message)
}

type CreateGuestPledgeInput = {
  favpollPollId: string
  guestEmail: string
  totalAmount: number
  /** Optional contribution to favpoll (pounds) — never charity money */
  tipAmount?: number
  /** Name shown on the guest wall; blank = appears as "Someone" */
  displayName?: string | null
  /** Hide the name from the public guest wall (organiser still sees it) */
  isAnonymous?: boolean
  allocations: PledgeAllocationInput[]
  /** The Stripe PaymentIntent that charged this pledge */
  paymentIntentId: string
}

/**
 * Pre-payment probe: does an active guest pledge already exist for this
 * email on this poll? Checked BEFORE Stripe charges — createGuestPledge
 * re-checks afterwards, but by then the money has moved and the guest saw
 * a frozen "Processing…" instead of the message (found on-device,
 * 2026-07-26).
 */
export async function guestPledgeExists(
  favpollPollId: string,
  guestEmail: string
): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("pledges")
    .select("id")
    .eq("favpoll_poll_id", favpollPollId)
    .eq("guest_email", guestEmail)
    .is("withdrawn_at", null)
    .maybeSingle()
  return !!data
}

/**
 * Pre-payment probe for the guest flow: whether this email belongs to a
 * registered account (sign-in invitation — pledging as a guest with an
 * account email would orphan the pledge from their history), and whether
 * it already holds an active guest pledge on this poll (sign-up
 * invitation). Both checked BEFORE Stripe charges.
 */
export async function guestPreflightState(
  favpollPollId: string,
  guestEmail: string
): Promise<{ hasAccount: boolean; hasActivePledge: boolean }> {
  const supabase = createAdminClient()
  // ilike with escaped wildcards: case-insensitive exact match
  const emailPattern = guestEmail.replace(/[\\%_]/g, (m) => "\\" + m)
  const [{ data: account }, { data: pledge }] = await Promise.all([
    supabase
      .from("users")
      .select("id")
      .ilike("email", emailPattern)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pledges")
      .select("id")
      .eq("favpoll_poll_id", favpollPollId)
      .eq("guest_email", guestEmail)
      .is("withdrawn_at", null)
      .limit(1)
      .maybeSingle(),
  ])
  return { hasAccount: !!account, hasActivePledge: !!pledge }
}

export async function createGuestPledge(input: CreateGuestPledgeInput) {
  if (!input.guestEmail) throw new Error("Email is required")

  await verifyPledgePayment({
    paymentIntentId: input.paymentIntentId,
    favpollPollId: input.favpollPollId,
    totalAmount: input.totalAmount,
    tipAmount: input.tipAmount ?? 0,
  })

  const supabase = createAdminClient()
  await assertUnusedPaymentIntent(supabase, input.paymentIntentId)

  // Check for existing active pledge from same email on same poll
  const { data: existing } = await supabase
    .from("pledges")
    .select("id")
    .eq("favpoll_poll_id", input.favpollPollId)
    .eq("guest_email", input.guestEmail)
    .is("withdrawn_at", null)
    .maybeSingle()

  if (existing) {
    throw new Error(
      "You've already pledged on this poll. Check your email for a withdrawal link if you'd like to change it."
    )
  }

  const guest_token = crypto.randomUUID()

  const { data: pledge, error: pledgeErr } = await supabase
    .from("pledges")
    .insert({
      favpoll_poll_id: input.favpollPollId,
      clerk_user_id: null,
      guest_email: input.guestEmail,
      guest_token,
      pot_allocation_id: null,
      total_amount: input.totalAmount,
      fee: 0,
      tip_amount: input.tipAmount ?? 0,
      display_name: input.displayName?.trim() || null,
      is_anonymous: input.isAnonymous ?? false,
      payment_intent_id: input.paymentIntentId,
    })
    .select("id")
    .single()

  if (pledgeErr || !pledge)
    throw new Error(pledgeErr?.message ?? "Failed to create pledge")

  const { error: allocErr } = await supabase.from("pledge_allocations").insert(
    input.allocations
      .filter((a) => a.amount > 0)
      .map((a) => ({
        pledge_id: pledge.id,
        favourite_id: a.favouriteId,
        amount: a.amount,
      }))
  )

  if (allocErr) throw new Error(allocErr.message)

  // Fetch favpoll data for confirmation email
  const { data: pollData } = await supabase
    .from("favpoll_polls")
    .select(
      "favpoll_id, favpolls(closes_at, cause_label, protagonists(name), favpoll_charities(charities(name)))"
    )
    .eq("id", input.favpollPollId)
    .single()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
    const favpollData = pollData?.favpolls as any
    const protagonistName: string =
      favpollData?.protagonists?.name ??
      favpollData?.cause_label ??
      "this favpoll"
    const closesAt: string = favpollData?.closes_at ?? ""
    const charityNames: string[] = (favpollData?.favpoll_charities ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
      (ec: any) => ec.charities.name
    )

    await sendPledgeConfirmation({
      to: input.guestEmail,
      protagonistName,
      charityNames,
      amount: input.totalAmount,
      closesAt,
      guestToken: guest_token,
      favpollId: pollData?.favpoll_id ?? "",
    })
  } catch (emailErr) {
    console.error("Failed to send pledge confirmation email:", emailErr)
  }

  return guest_token
}

export async function addGuestItem(
  favpollPollId: string,
  topicId: string,
  label: string
) {
  // NO ACCOUNT REQUIRED (founder, 2026-08-13). Guests pledge with an email
  // and nothing else, so requiring sign-in here made "guests can add missing
  // favourites" false for almost every guest — the door was advertised and
  // most people could not open it. added_by is nullable and carries whoever
  // was signed in, if anyone.
  //
  // What replaces the account as a check: the same fail-open IP limiter the
  // contact form and extension requests use, plus review_status
  // "pending_review" on the favourite and an email to the organiser, who can
  // hide it. An unauthenticated write needs all three.
  const { userId } = await auth()
  const ip = ipFromHeaders(await headers())
  if (
    await isRateLimited("guest-item", ip, [
      { name: "10m", max: 8, windowSeconds: 600 },
      { name: "1d", max: 40, windowSeconds: 86_400 },
    ])
  ) {
    throw new Error(RATE_LIMIT_MESSAGE)
  }

  // The pre-existing per-user limit, now keyed on the IP when there is no
  // user — otherwise every anonymous guest would share a single "null"
  // bucket and the first eight would spend it for the whole internet.
  if (
    await isRateLimited("guest-item-actor", userId ?? `ip:${ip}`, [
      { name: "1h", max: 20, windowSeconds: 3600 },
    ])
  ) {
    throw new Error("Too many additions — please try again later.")
  }

  const supabase = createAdminClient()
  const trimmed = label.trim()
  if (!trimmed) throw new Error("Label is required")

  // Re-use existing favourite if label matches (case-insensitive)
  const { data: existing } = await supabase
    .from("favourites")
    .select("id")
    .eq("topic_id", topicId)
    .ilike("label", trimmed)
    .maybeSingle()

  let favouriteId: string

  if (existing) {
    favouriteId = existing.id
  } else {
    const { data: newItem, error } = await supabase
      .from("favourites")
      .insert({
        topic_id: topicId,
        label: trimmed,
        source: "guest",
        is_canonical: false,
        review_status: "pending_review",
      })
      .select("id")
      .single()
    if (error || !newItem)
      throw new Error(error?.message ?? "Failed to create item")
    favouriteId = newItem.id
  }

  // The organiser's setting is checked HERE, not only where the button is
  // drawn. Hiding a control is not a permission check, and this action is
  // callable directly.
  const { data: owner } = await supabase
    .from("favpoll_polls")
    .select("favpolls(allow_guest_items)")
    .eq("id", favpollPollId)
    .single()
  const allowed =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (owner?.favpolls as any)?.allow_guest_items !== false
  if (!allowed) throw new Error("This favpoll is not taking new favourites")

  const { error: epiErr } = await supabase
    .from("favpoll_poll_favourites")
    .insert({
      favpoll_poll_id: favpollPollId,
      favourite_id: favouriteId,
      is_guest_added: true,
      added_by: userId ?? null,
    })
  if (epiErr) throw new Error(epiErr.message)

  // Notify the organiser — fire and forget, never fail the main action
  try {
    const { data: pollData } = await supabase
      .from("favpoll_polls")
      .select(
        "favpoll_id, favpolls(id, occasion_type, created_by, protagonists(name)), topics(title)"
      )
      .eq("id", favpollPollId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
    const favpollData = pollData?.favpolls as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
    const topicData = pollData?.topics as any
    const organizerUserId: string | null = favpollData?.created_by ?? null

    if (organizerUserId) {
      const { data: organizer } = await supabase
        .from("users")
        .select("email")
        .eq("id", organizerUserId)
        .single()

      if (organizer?.email) {
        await sendGuestItemAdded({
          to: organizer.email,
          itemLabel: trimmed,
          topicTitle: topicData?.title ?? "poll",
          openingLine: favpollData?.occasion_type ?? "favpoll",
          protagonistName: favpollData?.protagonists?.name ?? "your favpoll",
          favpollId: pollData?.favpoll_id ?? "",
        })
      } else {
        console.warn(
          "[addGuestItem] organiser has no email on record, skipping notification"
        )
      }
    }
  } catch (emailErr) {
    console.error(
      "[addGuestItem] failed to send organiser notification:",
      emailErr
    )
  }
}

export async function addOrganizerItem(favpollId: string, label: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const trimmed = label.trim()
  if (!trimmed) throw new Error("Label is required")

  // Verify ownership
  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by")
    .eq("id", favpollId)
    .single()
  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  // Fetch poll + topic, verify infinite
  const { data: poll } = await supabase
    .from("favpoll_polls")
    .select("id, topic_id, topics(is_finite)")
    .eq("favpoll_id", favpollId)
    .single()
  if (!poll) throw new Error("No poll found")
  const topicMeta = Array.isArray(poll.topics) ? poll.topics[0] : poll.topics
  if ((topicMeta as { is_finite: boolean } | null)?.is_finite)
    throw new Error("Cannot add favourites to a finite topic")

  const topicId = poll.topic_id

  // Reuse existing favourite if label matches (case-insensitive)
  const { data: existing } = await supabase
    .from("favourites")
    .select("id")
    .eq("topic_id", topicId)
    .ilike("label", trimmed)
    .maybeSingle()

  let favouriteId: string
  if (existing) {
    favouriteId = existing.id
  } else {
    const { data: newItem, error } = await supabase
      .from("favourites")
      .insert({
        topic_id: topicId,
        label: trimmed,
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
        markets: ["en-GB"],
      })
      .select("id")
      .single()
    if (error || !newItem)
      throw new Error(error?.message ?? "Failed to create item")
    favouriteId = newItem.id
  }

  // Idempotent — skip if already in poll
  const { data: existingEpi } = await supabase
    .from("favpoll_poll_favourites")
    .select("id")
    .eq("favpoll_poll_id", poll.id)
    .eq("favourite_id", favouriteId)
    .maybeSingle()
  if (existingEpi) return

  const { error: epiErr } = await supabase
    .from("favpoll_poll_favourites")
    .insert({
      favpoll_poll_id: poll.id,
      favourite_id: favouriteId,
      is_guest_added: false,
      added_by: userId,
    })
  if (epiErr) throw new Error(epiErr.message)
}

export async function removeFavpollPollFavourite(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("favpoll_poll_favourites")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function pledgeFromFund(input: {
  favpollPollId: string
  potId: string
  totalAmount: number
  isAnonymous?: boolean
  allocations: PledgeAllocationInput[]
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  // Atomic guarded reservation (pot_allocate refuses to allocate more than
  // the fund holds) — the server no longer trusts a client-supplied
  // current-allocated figure, and concurrent allocations cannot oversell.
  const { data: allocated, error: potErr } = await supabase.rpc(
    "pot_allocate",
    { p_pot_id: input.potId, p_amount: input.totalAmount }
  )
  if (potErr) throw new Error(potErr.message)
  if (!allocated) {
    throw new Error("There isn't enough left in the shared fund for that.")
  }

  const { data: pledge, error: pledgeErr } = await supabase
    .from("pledges")
    .insert({
      favpoll_poll_id: input.favpollPollId,
      clerk_user_id: userId,
      pot_allocation_id: input.potId,
      total_amount: input.totalAmount,
      fee: 0,
      is_anonymous: input.isAnonymous ?? false,
    })
    .select("id")
    .single()
  if (pledgeErr || !pledge) {
    // Best-effort release of the reservation so the fund isn't drained by
    // a failed pledge
    await supabase.rpc("pot_deallocate", {
      p_pot_id: input.potId,
      p_amount: input.totalAmount,
    })
    throw new Error(pledgeErr?.message ?? "Failed to create pledge")
  }

  const { error: allocErr } = await supabase.from("pledge_allocations").insert(
    input.allocations
      .filter((a) => a.amount > 0)
      .map((a) => ({
        pledge_id: pledge.id,
        favourite_id: a.favouriteId,
        amount: a.amount,
      }))
  )
  if (allocErr) throw new Error(allocErr.message)
}

// Shared-fund credits: verified against Stripe (the payment IS the
// authorisation — a guest needs no account to give to the fund) and applied
// via the atomic pot_top_up RPC, whose ledger (pot_topups, unique
// payment_intent_id) makes each payment creditable exactly once.
async function creditFund(
  favpollId: string,
  amount: number,
  paymentIntentId: string,
  clerkUserId: string | null
) {
  await verifyTopUpPayment({ paymentIntentId, favpollId, topUpAmount: amount })

  const supabase = createAdminClient()
  const { error } = await supabase.rpc("pot_top_up", {
    p_favpoll_id: favpollId,
    p_amount: amount,
    p_payment_intent_id: paymentIntentId,
    p_clerk_user_id: clerkUserId,
  })
  if (error) {
    if (error.message.includes("pot_topups_payment_intent_id_key")) {
      throw new Error("This payment has already been recorded.")
    }
    throw new Error(error.message)
  }
}

export async function topUpFundAsGuest(
  favpollId: string,
  amount: number,
  paymentIntentId: string
) {
  await creditFund(favpollId, amount, paymentIntentId, null)
}

export async function topUpFund(
  favpollId: string,
  amount: number,
  paymentIntentId: string
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  await creditFund(favpollId, amount, paymentIntentId, userId)
}

// Deletion is for favpolls that never took money: any pledge or shared-fund
// deposit is a financial record and permanently blocks deletion (re-checked
// here — the client's counts are display state, not authority).
export async function deleteFavpoll(favpollId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "created_by, protagonist_id, favpoll_polls ( id, pledges ( count ) ), favpoll_pots ( id, total_deposited )"
    )
    .eq("id", favpollId)
    .single()

  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  type PollRow = { id: string; pledges: { count: number }[] | null }
  type PotRow = { id: string; total_deposited: number }
  const polls: PollRow[] = Array.isArray(favpoll.favpoll_polls)
    ? favpoll.favpoll_polls
    : favpoll.favpoll_polls
      ? [favpoll.favpoll_polls]
      : []
  const pots: PotRow[] = Array.isArray(favpoll.favpoll_pots)
    ? favpoll.favpoll_pots
    : favpoll.favpoll_pots
      ? [favpoll.favpoll_pots]
      : []

  const pledgeCount = polls.reduce(
    (n, p) => n + (p.pledges?.[0]?.count ?? 0),
    0
  )
  const deposited = pots.reduce((n, p) => n + (p.total_deposited ?? 0), 0)
  if (pledgeCount > 0 || deposited > 0)
    throw new Error("This favpoll has pledges and can't be deleted.")

  const pollIds = polls.map((p) => p.id)
  if (pollIds.length > 0) {
    await supabase
      .from("favpoll_poll_favourites")
      .delete()
      .in("favpoll_poll_id", pollIds)
    await supabase.from("favpoll_polls").delete().eq("favpoll_id", favpollId)
  }
  await supabase.from("favpoll_charities").delete().eq("favpoll_id", favpollId)
  const potIds = pots.map((p) => p.id)
  if (potIds.length > 0) {
    await supabase.from("pot_allocations").delete().in("pot_id", potIds)
    await supabase.from("favpoll_pots").delete().eq("favpoll_id", favpollId)
  }

  const { error } = await supabase.from("favpolls").delete().eq("id", favpollId)
  if (error) throw new Error(error.message)

  // The protagonist row is per-favpoll (created alongside it) — remove the
  // orphan after the favpoll no longer references it.
  if (favpoll.protagonist_id) {
    await supabase
      .from("protagonists")
      .delete()
      .eq("id", favpoll.protagonist_id)
  }
}

export async function setFavpollGuestItems(
  favpollId: string,
  allowGuestItems: boolean
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by")
    .eq("id", favpollId)
    .single()

  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("favpolls")
    .update({ allow_guest_items: allowGuestItems })
    .eq("id", favpollId)

  if (error) throw new Error(error.message)
}

export async function setFavpollListed(favpollId: string, isListed: boolean) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by")
    .eq("id", favpollId)
    .single()

  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("favpolls")
    .update({ is_listed: isListed })
    .eq("id", favpollId)

  if (error) throw new Error(error.message)
}
