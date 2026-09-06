"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CanvasSubmitData } from "@favpoll/types"

type PollInput = CanvasSubmitData["poll"]

async function upsertPollForFavpoll(
  supabase: ReturnType<typeof createAdminClient>,
  favpollId: string,
  userId: string,
  poll: PollInput
) {
  if (poll.id) {
    // Check if the topic has changed before touching items
    const { data: currentPoll } = await supabase
      .from("favpoll_polls")
      .select("topic_id")
      .eq("id", poll.id)
      .single()

    const topicChanged = currentPoll?.topic_id !== poll.topicId

    await supabase
      .from("favpoll_polls")
      .update({
        topic_id: poll.topicId,
        personal_reveal: poll.reveal?.trim() || null,
      })
      .eq("id", poll.id)

    // Only delete and re-insert items if the topic changed
    if (topicChanged && poll.infiniteItems) {
      const { canonicalItemIds, customLabels } = poll.infiniteItems

      // Delete all organiser-curated items; guest-added items are preserved
      await supabase
        .from("favpoll_poll_favourites")
        .delete()
        .eq("favpoll_poll_id", poll.id)
        .eq("is_guest_added", false)

      // Create favourite rows for any new organiser-curated labels
      const allItemIds = [...canonicalItemIds]
      if (customLabels.length > 0) {
        const { data: newCustomItems } = await supabase
          .from("favourites")
          .insert(
            customLabels.map((label) => ({
              topic_id: poll.topicId!,
              label: label.trim(),
              source: "organiser" as const,
              is_canonical: false,
            }))
          )
          .select("id")
        allItemIds.push(...(newCustomItems ?? []).map((i) => i.id))
      }

      if (allItemIds.length > 0) {
        await supabase.from("favpoll_poll_favourites").insert(
          allItemIds.map((itemId) => ({
            favpoll_poll_id: poll.id,
            favourite_id: itemId,
            is_guest_added: false,
            added_by: userId,
          }))
        )
      }
    }
    return
  }

  // New poll — create from scratch
  let topicId = poll.topicId
  let customItemIds: string[] = []

  if (!topicId && poll.topicIsCustom) {
    const { data: newTopic, error: topicErr } = await supabase
      .from("topics")
      .insert({
        title: poll.customTopicTitle.trim(),
        created_by: userId,
        is_finite: false,
        is_active: true,
      })
      .select("id")
      .single()
    if (topicErr || !newTopic)
      throw new Error(`Failed to create topic: ${topicErr?.message}`)
    topicId = newTopic.id

    const itemsToInsert = poll.customTopicItems
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label) => ({
        topic_id: topicId!,
        label,
        source: "organiser" as const,
        is_canonical: false,
      }))

    if (itemsToInsert.length > 0) {
      const { data: newItems } = await supabase
        .from("favourites")
        .insert(itemsToInsert)
        .select("id")
      customItemIds = (newItems ?? []).map((i) => i.id)
    }
  }

  if (!topicId) return

  const { data: favpollPoll, error: pollErr } = await supabase
    .from("favpoll_polls")
    .insert({
      favpoll_id: favpollId,
      topic_id: topicId,
      personal_reveal: poll.reveal?.trim() || null,
    })
    .select("id")
    .single()

  if (pollErr || !favpollPoll)
    throw new Error(`Failed to create poll: ${pollErr?.message}`)

  if (customItemIds.length > 0) {
    await supabase.from("favpoll_poll_favourites").insert(
      customItemIds.map((itemId) => ({
        favpoll_poll_id: favpollPoll.id,
        favourite_id: itemId,
        is_guest_added: false,
        added_by: userId,
      }))
    )
  }

  if (!poll.topicIsCustom && poll.infiniteItems) {
    const { canonicalItemIds, customLabels } = poll.infiniteItems
    const allItemIds = [...canonicalItemIds]

    if (customLabels.length > 0) {
      const { data: newCustomItems } = await supabase
        .from("favourites")
        .insert(
          customLabels.map((label) => ({
            topic_id: topicId!,
            label: label.trim(),
            source: "organiser" as const,
            is_canonical: false,
          }))
        )
        .select("id")
      allItemIds.push(...(newCustomItems ?? []).map((i) => i.id))
    }

    if (allItemIds.length > 0) {
      await supabase.from("favpoll_poll_favourites").insert(
        allItemIds.map((itemId) => ({
          favpoll_poll_id: favpollPoll.id,
          favourite_id: itemId,
          is_guest_added: false,
          added_by: userId,
        }))
      )
    }
  }
}

export async function updateClosesAt(favpollId: string, closesAt: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by, closes_at, hard_close_at, extension_count")
    .eq("id", favpollId)
    .single()

  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  const newClosesAt = new Date(closesAt).toISOString()
  const currentClosesAt = new Date(favpoll.closes_at)
  const isExtension = new Date(newClosesAt) > currentClosesAt

  if (isExtension) {
    if (new Date(newClosesAt) <= new Date()) {
      throw new Error("Closing date must be in the future")
    }
    if ((favpoll.extension_count ?? 0) >= 2) {
      throw new Error(
        "Maximum extensions reached. Please contact us to request a further extension."
      )
    }
    if (
      favpoll.hard_close_at &&
      new Date(newClosesAt) > new Date(favpoll.hard_close_at)
    ) {
      const cap = new Date(favpoll.hard_close_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      throw new Error(`Closing date cannot be extended beyond ${cap}`)
    }
  }

  await supabase
    .from("favpolls")
    .update({
      closes_at: newClosesAt,
      ...(isExtension && {
        extension_count: (favpoll.extension_count ?? 0) + 1,
      }),
    })
    .eq("id", favpollId)
}

export async function updateFavpoll(
  favpollId: string,
  protagonistId: string,
  input: CanvasSubmitData
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  if (input.subject === "someone" && !input.protagonistName.trim())
    throw new Error("A name is required")
  if (input.subject === "cause" && !input.causeLabel?.trim())
    throw new Error("A cause name is required")

  const supabase = createAdminClient()

  // Verify ownership and fetch current closes_at/extension fields
  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "created_by, closes_at, hard_close_at, extension_count, category, appeal_id, appeals(charity_id, closes_at), favpoll_charities(charity_id)"
    )
    .eq("id", favpollId)
    .single()

  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")

  // ── Step locking (extended-wizard Phase 2) ────────────────────────────
  // Once money has moved — any pledge, or any shared-fund deposit — the
  // event, charity and topic are structural: changing them would reroute
  // funds or invalidate what guests pledged on. Enforced here regardless
  // of what the UI showed.
  const { data: currentPollRow } = await supabase
    .from("favpoll_polls")
    .select("id, topic_id")
    .eq("favpoll_id", favpollId)
    .maybeSingle()

  let moneyMoved = false
  if (currentPollRow) {
    const { count } = await supabase
      .from("pledges")
      .select("id", { count: "exact", head: true })
      .eq("favpoll_poll_id", currentPollRow.id)
    moneyMoved = (count ?? 0) > 0
  }
  if (!moneyMoved) {
    const { data: pot } = await supabase
      .from("favpoll_pots")
      .select("total_deposited")
      .eq("favpoll_id", favpollId)
      .maybeSingle()
    moneyMoved = (pot?.total_deposited ?? 0) > 0
  }
  if (moneyMoved) {
    const currentCharities = (favpoll.favpoll_charities ?? [])
      .map((c: { charity_id: string }) => c.charity_id)
      .sort()
      .join(",")
    const nextCharities = [...input.charityIds].sort().join(",")
    const topicChanged = currentPollRow
      ? currentPollRow.topic_id !== (input.poll.topicId || null)
      : false
    if (
      (favpoll.category ?? null) !== (input.category ?? null) ||
      currentCharities !== nextCharities ||
      topicChanged
    ) {
      throw new Error(
        "The event, charity and topic are locked once guests have pledged."
      )
    }
  }

  // Appeal membership guards (concept, 2026-09-05): the charity is the
  // appeal's, always; an inherited end date is not the member's to move.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memberAppeal = favpoll.appeal_id ? (favpoll.appeals as any) : null
  if (memberAppeal) {
    const nextCharities = [...input.charityIds].sort().join(",")
    if (nextCharities !== memberAppeal.charity_id) {
      throw new Error("This favpoll's charity is set by its appeal.")
    }
    if (
      memberAppeal.closes_at &&
      new Date(input.closesAt).toISOString() !==
        new Date(favpoll.closes_at).toISOString()
    ) {
      throw new Error("This favpoll's close date is set by its appeal.")
    }
  }

  const newClosesAt = new Date(input.closesAt).toISOString()
  const currentClosesAt = new Date(favpoll.closes_at)
  const isExtension = new Date(newClosesAt) > currentClosesAt

  if (isExtension) {
    if (new Date(newClosesAt) <= new Date()) {
      throw new Error("Closing date must be in the future")
    }
    if ((favpoll.extension_count ?? 0) >= 2) {
      throw new Error(
        "Maximum extensions reached. Please contact us to request a further extension."
      )
    }
    if (
      favpoll.hard_close_at &&
      new Date(newClosesAt) > new Date(favpoll.hard_close_at)
    ) {
      const cap = new Date(favpoll.hard_close_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      throw new Error(`Closing date cannot be extended beyond ${cap}`)
    }
  }

  // Update protagonist — only if this is a person favpoll
  if (input.subject === "someone") {
    await supabase
      .from("protagonists")
      .update({
        name: input.protagonistName.trim(),
        context: input.dateLabel,
        about: input.protagonistAbout ?? null,
        photo_url: input.photoUrl ?? null,
        pronoun: input.pronoun ?? null,
      })
      .eq("id", protagonistId)
  }

  // Update favpoll
  await supabase
    .from("favpolls")
    .update({
      subject: input.subject,
      cause_label: input.causeLabel,
      category: input.category,
      grouping: input.grouping,
      is_plural: input.grouping !== "individual",
      opening_line: input.openingLine,
      closes_at: newClosesAt,
      is_private: input.isPrivate,
      is_listed: input.isListed,
      allow_guest_items: input.allowGuestItems,
      description: input.description,
      goal_amount: input.goalAmount ?? null,
      // Cause favpolls keep photo/context on the favpoll row — person
      // favpolls store them on the protagonist (updated above).
      photo_url: input.subject === "cause" ? input.photoUrl || null : null,
      context: input.subject === "cause" ? input.dateLabel || null : null,
      ...(isExtension && {
        extension_count: (favpoll.extension_count ?? 0) + 1,
      }),
    })
    .eq("id", favpollId)

  // Replace charities
  await supabase.from("favpoll_charities").delete().eq("favpoll_id", favpollId)
  if (input.charityIds.length > 0) {
    await supabase.from("favpoll_charities").insert(
      input.charityIds.map((charityId, i) => ({
        favpoll_id: favpollId,
        charity_id: charityId,
        display_order: i,
      }))
    )
  }

  // Upsert the single favpoll poll
  await upsertPollForFavpoll(supabase, favpollId, userId, input.poll)
}
