"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendPledgeConfirmation, sendGuestItemAdded } from "@/lib/email"

type PledgeAllocationInput = {
  topicItemId: string
  amount: number
}

type CreatePledgeInput = {
  eventPollId: string
  potAllocationId: string | null
  totalAmount: number
  allocations: PledgeAllocationInput[]
}

const FEE_RATE = 0.03

export async function createPledge(input: CreatePledgeInput) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const fee = Math.round(input.totalAmount * FEE_RATE * 100) / 100
  const supabase = createAdminClient()

  const { data: pledge, error: pledgeErr } = await supabase
    .from("pledges")
    .insert({
      event_poll_id: input.eventPollId,
      clerk_user_id: userId,
      pot_allocation_id: input.potAllocationId,
      total_amount: input.totalAmount,
      fee,
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
        topic_item_id: a.topicItemId,
        amount: a.amount,
      }))
  )

  if (allocErr) throw new Error(allocErr.message)
}

type CreateGuestPledgeInput = {
  eventPollId: string
  guestEmail: string
  totalAmount: number
  allocations: PledgeAllocationInput[]
}

export async function createGuestPledge(input: CreateGuestPledgeInput) {
  if (!input.guestEmail) throw new Error("Email is required")

  const fee = Math.round(input.totalAmount * FEE_RATE * 100) / 100
  const supabase = createAdminClient()

  // Check for existing active pledge from same email on same poll
  const { data: existing } = await supabase
    .from("pledges")
    .select("id")
    .eq("event_poll_id", input.eventPollId)
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
      event_poll_id: input.eventPollId,
      clerk_user_id: null,
      guest_email: input.guestEmail,
      guest_token,
      pot_allocation_id: null,
      total_amount: input.totalAmount,
      fee,
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
        topic_item_id: a.topicItemId,
        amount: a.amount,
      }))
  )

  if (allocErr) throw new Error(allocErr.message)

  // Fetch event data for confirmation email
  const { data: pollData } = await supabase
    .from("event_polls")
    .select(
      "event_id, events(closes_at, protagonists(name), event_charities(charities(name)))"
    )
    .eq("id", input.eventPollId)
    .single()

  try {
    const eventData = pollData?.events as any
    const protagonistName: string =
      eventData?.protagonists?.name ?? "this event"
    const closesAt: string = eventData?.closes_at ?? ""
    const charityNames: string[] = (eventData?.event_charities ?? []).map(
      (ec: any) => ec.charities.name
    )

    await sendPledgeConfirmation({
      to: input.guestEmail,
      protagonistName,
      charityNames,
      amount: input.totalAmount,
      closesAt,
      guestToken: guest_token,
    })
  } catch (emailErr) {
    console.error("Failed to send pledge confirmation email:", emailErr)
  }

  return guest_token
}

export async function addGuestItem(
  eventPollId: string,
  topicId: string,
  label: string
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const trimmed = label.trim()
  if (!trimmed) throw new Error("Label is required")

  // Re-use existing topic_item if label matches (case-insensitive)
  const { data: existing } = await supabase
    .from("topic_items")
    .select("id")
    .eq("topic_id", topicId)
    .ilike("label", trimmed)
    .maybeSingle()

  let topicItemId: string

  if (existing) {
    topicItemId = existing.id
  } else {
    const { data: newItem, error } = await supabase
      .from("topic_items")
      .insert({
        topic_id: topicId,
        label: trimmed,
        source: "guest",
        is_canonical: false,
        review_status: "pending",
      })
      .select("id")
      .single()
    if (error || !newItem)
      throw new Error(error?.message ?? "Failed to create item")
    topicItemId = newItem.id
  }

  const { error: epiErr } = await supabase.from("event_poll_items").insert({
    event_poll_id: eventPollId,
    topic_item_id: topicItemId,
    is_guest_added: true,
    added_by: userId,
  })
  if (epiErr) throw new Error(epiErr.message)

  // Notify the organiser — fire and forget, never fail the main action
  try {
    const { data: pollData } = await supabase
      .from("event_polls")
      .select(
        "event_id, events(id, occasion, created_by, protagonists(name)), topics(title)"
      )
      .eq("id", eventPollId)
      .single()

    const eventData = pollData?.events as any
    const topicData = pollData?.topics as any
    const organizerUserId: string | null = eventData?.created_by ?? null

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
          openingLine: eventData?.occasion ?? "event",
          protagonistName: eventData?.protagonists?.name ?? "your event",
          eventId: pollData?.event_id ?? "",
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

export async function addOrganizerItem(eventId: string, label: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const trimmed = label.trim()
  if (!trimmed) throw new Error("Label is required")

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single()
  if (!event || event.created_by !== userId) throw new Error("Unauthorized")

  // Fetch poll + topic, verify infinite
  const { data: poll } = await supabase
    .from("event_polls")
    .select("id, topic_id, topics(is_finite)")
    .eq("event_id", eventId)
    .single()
  if (!poll) throw new Error("No poll found")
  if ((poll.topics as { is_finite: boolean } | null)?.is_finite)
    throw new Error("Cannot add items to a finite topic")

  const topicId = poll.topic_id

  // Reuse existing topic_item if label matches (case-insensitive)
  const { data: existing } = await supabase
    .from("topic_items")
    .select("id")
    .eq("topic_id", topicId)
    .ilike("label", trimmed)
    .maybeSingle()

  let topicItemId: string
  if (existing) {
    topicItemId = existing.id
  } else {
    const { data: newItem, error } = await supabase
      .from("topic_items")
      .insert({
        topic_id: topicId,
        label: trimmed,
        source: "organiser",
        is_canonical: false,
        review_status: "pending",
        markets: ["en-GB"],
      })
      .select("id")
      .single()
    if (error || !newItem)
      throw new Error(error?.message ?? "Failed to create item")
    topicItemId = newItem.id
  }

  // Idempotent — skip if already in poll
  const { data: existingEpi } = await supabase
    .from("event_poll_items")
    .select("id")
    .eq("event_poll_id", poll.id)
    .eq("topic_item_id", topicItemId)
    .maybeSingle()
  if (existingEpi) return

  const { error: epiErr } = await supabase.from("event_poll_items").insert({
    event_poll_id: poll.id,
    topic_item_id: topicItemId,
    is_guest_added: false,
    added_by: userId,
  })
  if (epiErr) throw new Error(epiErr.message)
}

export async function removeEventPollItem(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("event_poll_items")
    .delete()
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function pledgeFromFund(input: {
  eventPollId: string
  potId: string
  potCurrentAllocated: number
  totalAmount: number
  allocations: PledgeAllocationInput[]
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { error: potErr } = await supabase
    .from("event_pots")
    .update({ total_allocated: input.potCurrentAllocated + input.totalAmount })
    .eq("id", input.potId)
  if (potErr) throw new Error(potErr.message)

  const { data: pledge, error: pledgeErr } = await supabase
    .from("pledges")
    .insert({
      event_poll_id: input.eventPollId,
      clerk_user_id: userId,
      pot_allocation_id: input.potId,
      total_amount: input.totalAmount,
      fee: 0,
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
        topic_item_id: a.topicItemId,
        amount: a.amount,
      }))
  )
  if (allocErr) throw new Error(allocErr.message)
}

export async function topUpFund(eventId: string, amount: number) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { data: pot } = await supabase
    .from("event_pots")
    .select("id, total_deposited")
    .eq("event_id", eventId)
    .single()

  if (!pot) throw new Error("No fund found for this event")

  const { error } = await supabase
    .from("event_pots")
    .update({ total_deposited: pot.total_deposited + amount })
    .eq("id", pot.id)

  if (error) throw new Error(error.message)
}
