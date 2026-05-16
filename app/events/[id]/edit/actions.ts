'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CanvasSubmitData } from '@/types'

type PollInput = CanvasSubmitData['polls'][number]

async function upsertPollForEvent(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
  userId: string,
  poll: PollInput,
) {
  if (poll.id) {
    await supabase
      .from('event_polls')
      .update({
        personal_framing: poll.framing?.trim() || null,
        personal_quote: poll.quote?.trim() || null,
      })
      .eq('id', poll.id)

    if (poll.infiniteItems) {
      const { prioritizedItemIds, masterItemIds } = poll.infiniteItems
      await supabase
        .from('event_poll_items')
        .delete()
        .eq('event_poll_id', poll.id)
        .eq('is_guest_added', false)

      if (masterItemIds.length > 0) {
        await supabase.from('event_poll_items').insert(
          masterItemIds.map((itemId, index) => ({
            event_poll_id: poll.id,
            topic_item_id: itemId,
            is_guest_added: false,
            added_by: userId,
            display_order: index,
            is_prioritized: prioritizedItemIds.includes(itemId),
          })),
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
      .from('topics')
      .insert({ title: poll.customTopicTitle.trim(), created_by: userId, is_finite: false, is_active: false })
      .select('id')
      .single()
    if (topicErr || !newTopic) throw new Error(`Failed to create topic: ${topicErr?.message}`)
    topicId = newTopic.id

    const itemsToInsert = poll.customTopicItems
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label) => ({ topic_id: topicId!, label, source: 'organiser' as const, is_master: false }))

    if (itemsToInsert.length > 0) {
      const { data: newItems } = await supabase.from('topic_items').insert(itemsToInsert).select('id')
      customItemIds = (newItems ?? []).map((i) => i.id)
    }
  }

  if (!topicId) return

  const { data: eventPoll, error: pollErr } = await supabase
    .from('event_polls')
    .insert({
      event_id: eventId,
      topic_id: topicId,
      personal_framing: poll.framing?.trim() || null,
      personal_quote: poll.quote?.trim() || null,
    })
    .select('id')
    .single()

  if (pollErr || !eventPoll) throw new Error(`Failed to create poll: ${pollErr?.message}`)

  if (customItemIds.length > 0) {
    await supabase.from('event_poll_items').insert(
      customItemIds.map((itemId) => ({
        event_poll_id: eventPoll.id,
        topic_item_id: itemId,
        is_guest_added: false,
        added_by: userId,
      })),
    )
  }

  if (!poll.topicIsCustom && poll.infiniteItems) {
    const { masterItemIds, customLabels } = poll.infiniteItems
    const allItemIds = [...masterItemIds]

    if (customLabels.length > 0) {
      const { data: newCustomItems } = await supabase
        .from('topic_items')
        .insert(
          customLabels.map((label) => ({
            topic_id: topicId!,
            label: label.trim(),
            source: 'organiser' as const,
            is_master: false,
          })),
        )
        .select('id')
      allItemIds.push(...(newCustomItems ?? []).map((i) => i.id))
    }

    if (allItemIds.length > 0) {
      await supabase.from('event_poll_items').insert(
        allItemIds.map((itemId) => ({
          event_poll_id: eventPoll.id,
          topic_item_id: itemId,
          is_guest_added: false,
          added_by: userId,
        })),
      )
    }
  }
}

export async function updateEvent(
  eventId: string,
  personId: string,
  input: CanvasSubmitData,
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAdminClient()

  // Verify ownership and fetch current closes_at/extension fields
  const { data: event } = await supabase
    .from('events')
    .select('created_by, closes_at, hard_close_at, extension_count')
    .eq('id', eventId)
    .single()

  if (!event || event.created_by !== userId) throw new Error('Unauthorized')

  const newClosesAt = new Date(input.closesAt).toISOString()
  const currentClosesAt = new Date(event.closes_at)
  const isExtension = new Date(newClosesAt) > currentClosesAt

  if (isExtension) {
    if (new Date(newClosesAt) <= new Date()) {
      throw new Error('Closing date must be in the future')
    }
    if ((event.extension_count ?? 0) >= 2) {
      throw new Error('Maximum extensions reached. Please contact us to request a further extension.')
    }
    if (event.hard_close_at && new Date(newClosesAt) > new Date(event.hard_close_at)) {
      const cap = new Date(event.hard_close_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
      throw new Error(`Closing date cannot be extended beyond ${cap}`)
    }
  }

  // Update person
  await supabase
    .from('persons')
    .update({
      name: input.personName.trim(),
      date_label: input.dateLabel,
      bio: input.personBio ?? null,
      photo_url: input.photoUrl ?? null,
    })
    .eq('id', personId)

  // Update event
  await supabase
    .from('events')
    .update({
      occasion: input.occasion,
      occasion_label: input.occasionLabel,
      closes_at: newClosesAt,
      is_private: input.isPrivate,
      description: input.description,
      ...(isExtension && { extension_count: (event.extension_count ?? 0) + 1 }),
    })
    .eq('id', eventId)

  // Replace charities
  await supabase.from('event_charities').delete().eq('event_id', eventId)
  if (input.charityIds.length > 0) {
    await supabase.from('event_charities').insert(
      input.charityIds.map((charityId, i) => ({
        event_id: eventId,
        charity_id: charityId,
        display_order: i,
      })),
    )
  }

  // Handle polls: upsert existing, create new, delete removed (only if no pledges)
  const submittedIds = input.polls.map((p) => p.id).filter(Boolean) as string[]

  const { data: existingPolls } = await supabase
    .from('event_polls')
    .select('id')
    .eq('event_id', eventId)

  const toDelete = (existingPolls ?? [])
    .map((p) => p.id)
    .filter((id) => !submittedIds.includes(id))

  for (const id of toDelete) {
    const { data: pledges } = await supabase
      .from('pledges')
      .select('id')
      .eq('event_poll_id', id)
      .limit(1)
    if (!pledges || pledges.length === 0) {
      await supabase.from('event_polls').delete().eq('id', id)
    }
  }

  for (const poll of input.polls) {
    await upsertPollForEvent(supabase, eventId, userId, poll)
  }
}
