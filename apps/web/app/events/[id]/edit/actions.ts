'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CanvasSubmitData } from '@favpoll/types'

type PollInput = CanvasSubmitData['poll']

async function upsertPollForEvent(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
  userId: string,
  poll: PollInput,
) {
  if (poll.id) {
    // Always sync topic_id in case the organiser switched topics
    await supabase
      .from('event_polls')
      .update({
        topic_id: poll.topicId,
        personal_reveal: poll.reveal?.trim() || null,
      })
      .eq('id', poll.id)

    if (poll.infiniteItems) {
      const { prioritizedItemIds, canonicalItemIds, customLabels } = poll.infiniteItems

      // Delete all organiser-curated items; guest-added items are preserved
      await supabase
        .from('event_poll_items')
        .delete()
        .eq('event_poll_id', poll.id)
        .eq('is_guest_added', false)

      // Create topic_item rows for any new organiser-curated labels
      const allItemIds = [...canonicalItemIds]
      if (customLabels.length > 0) {
        const { data: newCustomItems } = await supabase
          .from('topic_items')
          .insert(
            customLabels.map((label) => ({
              topic_id: poll.topicId!,
              label: label.trim(),
              source: 'organiser' as const,
              is_canonical: false,
            })),
          )
          .select('id')
        allItemIds.push(...(newCustomItems ?? []).map((i) => i.id))
      }

      if (allItemIds.length > 0) {
        await supabase.from('event_poll_items').insert(
          allItemIds.map((itemId, index) => ({
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
      .map((label) => ({ topic_id: topicId!, label, source: 'organiser' as const, is_canonical: false }))

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
      personal_reveal: poll.reveal?.trim() || null,
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
    const { canonicalItemIds, customLabels } = poll.infiniteItems
    const allItemIds = [...canonicalItemIds]

    if (customLabels.length > 0) {
      const { data: newCustomItems } = await supabase
        .from('topic_items')
        .insert(
          customLabels.map((label) => ({
            topic_id: topicId!,
            label: label.trim(),
            source: 'organiser' as const,
            is_canonical: false,
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
  protagonistId: string,
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

  // Update protagonist
  await supabase
    .from('protagonists')
    .update({
      name: input.protagonistName.trim(),
      date_label: input.dateLabel,
      about: input.protagonistAbout ?? null,
      photo_url: input.photoUrl ?? null,
    })
    .eq('id', protagonistId)

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

  // Upsert the single event poll
  await upsertPollForEvent(supabase, eventId, userId, input.poll)
}
