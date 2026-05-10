'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

type CustomTopic = {
  title: string
  items: string[]
}

type InfiniteItems = {
  masterItemIds: string[]
  customLabels: string[]
}

type CreateEventInput = {
  personName: string
  photoUrl: string | null
  occasion: string
  charityId: string
  topicId: string | null
  customTopic: CustomTopic | null
  topicFraming: string | null
  topicQuote: string | null
  closesAt: string
  isPrivate: boolean
  potAmount: number | null
  infiniteItems: InfiniteItems | null
}

async function ensureUser(supabase: ReturnType<typeof createAdminClient>, userId: string) {
  const user = await currentUser()
  if (!user) return

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? null
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || null

  await supabase.from('users').upsert(
    { id: userId, email: primaryEmail, display_name: displayName, avatar_url: user.imageUrl },
    { onConflict: 'id' },
  )
}

export async function uploadPersonPhoto(formData: FormData): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const file = formData.get('photo') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const supabase = createAdminClient()

  // Ensure bucket exists (no-op if already exists)
  await supabase.storage.createBucket('persons', { public: true }).catch(() => null)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage.from('persons').upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from('persons').getPublicUrl(path)
  return data.publicUrl
}

export async function createEvent(input: CreateEventInput): Promise<{ eventId: string }> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAdminClient()

  await ensureUser(supabase, userId)

  const personRow: Record<string, unknown> = {
    name: input.personName.trim(),
    created_by: userId,
  }
  if (input.photoUrl) personRow.photo_url = input.photoUrl

  const { data: person, error: personErr } = await supabase
    .from('persons')
    .insert(personRow)
    .select('id')
    .single()

  if (personErr || !person) throw new Error(`Failed to create person: ${personErr?.message}`)

  const { data: event, error: eventErr } = await supabase
    .from('events')
    .insert({
      person_id: person.id,
      occasion: input.occasion,
      charity_id: input.charityId,
      created_by: userId,
      closes_at: new Date(input.closesAt).toISOString(),
      is_private: input.isPrivate,
    })
    .select('id')
    .single()

  if (eventErr || !event) throw new Error(`Failed to create event: ${eventErr?.message}`)

  // Resolve topic — create a custom one if needed
  let topicId = input.topicId

  let customItemIds: string[] = []

  if (!topicId && input.customTopic) {
    const { data: newTopic, error: topicErr } = await supabase
      .from('topics')
      .insert({ title: input.customTopic.title.trim(), created_by: userId })
      .select('id')
      .single()

    if (topicErr || !newTopic) throw new Error(`Failed to create topic: ${topicErr?.message}`)

    topicId = newTopic.id

    const itemsToInsert = input.customTopic.items
      .map((label) => label.trim())
      .filter(Boolean)
      .map((label) => ({ topic_id: topicId!, label, source: 'organiser', is_master: false }))

    if (itemsToInsert.length > 0) {
      const { data: newItems } = await supabase.from('topic_items').insert(itemsToInsert).select('id')
      customItemIds = (newItems ?? []).map((i) => i.id)
    }
  }

  if (topicId) {
    const { data: poll, error: pollErr } = await supabase
      .from('event_polls')
      .insert({
        event_id: event.id,
        topic_id: topicId,
        personal_framing: input.topicFraming?.trim() || null,
        personal_quote: input.topicQuote?.trim() || null,
      })
      .select('id')
      .single()

    if (pollErr || !poll) throw new Error(`Failed to create poll: ${pollErr?.message}`)

    // Custom topics: create event_poll_items for all items (custom topics are infinite-style)
    if (customItemIds.length > 0) {
      await supabase.from('event_poll_items').insert(
        customItemIds.map((itemId) => ({
          event_poll_id: poll.id,
          topic_item_id: itemId,
          is_guest_added: false,
          added_by: userId,
        })),
      )
    }

    // Existing infinite topics: create event_poll_items from curated selection
    if (!input.customTopic && input.infiniteItems) {
      const { masterItemIds, customLabels } = input.infiniteItems
      const allItemIds = [...masterItemIds]

      if (customLabels.length > 0) {
        const { data: newCustomItems } = await supabase
          .from('topic_items')
          .insert(
            customLabels.map((label) => ({
              topic_id: topicId!,
              label: label.trim(),
              source: 'organiser',
              is_master: false,
            })),
          )
          .select('id')
        allItemIds.push(...(newCustomItems ?? []).map((i) => i.id))
      }

      if (allItemIds.length > 0) {
        await supabase.from('event_poll_items').insert(
          allItemIds.map((itemId) => ({
            event_poll_id: poll.id,
            topic_item_id: itemId,
            is_guest_added: false,
            added_by: userId,
          })),
        )
      }
    }
  }

  if (input.potAmount && input.potAmount > 0) {
    const { error: potErr } = await supabase.from('event_pots').insert({
      event_id: event.id,
      created_by: userId,
      total_deposited: input.potAmount,
    })
    if (potErr) throw new Error(`Failed to create fund: ${potErr?.message}`)
  }

  return { eventId: event.id }
}
