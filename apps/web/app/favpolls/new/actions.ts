"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

type CustomTopic = {
  title: string
  items: string[]
}

type InfiniteItems = {
  canonicalItemIds: string[]
  customLabels: string[]
}

type PollInput = {
  topicId: string | null
  customTopic: CustomTopic | null
  reveal: string | null
  infiniteItems: InfiniteItems | null
  addedItems?: string[]
}

type CreateEventInput = {
  protagonistName: string
  protagonistAbout: string | null
  photoUrl: string | null
  dateLabel: string | null
  category: string | null
  grouping: string
  subject: "someone" | "cause"
  causeLabel: string | null
  openingLine: string | null
  description: string | null
  charityIds: string[]
  closesAt: string
  isPrivate: boolean
  isListed: boolean
  potAmount: number | null
  poll: PollInput
}

async function ensureUser(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const user = await currentUser()
  if (!user) return

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null

  await supabase.from("users").upsert(
    {
      id: userId,
      email: primaryEmail,
      display_name: displayName,
      avatar_url: user.imageUrl,
    },
    { onConflict: "id" }
  )
}

export async function uploadPersonPhoto(formData: FormData): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const file = formData.get("photo") as File
  if (!file || file.size === 0) throw new Error("No file provided")

  const supabase = createAdminClient()

  await supabase.storage
    .createBucket("protagonists", { public: true })
    .catch(() => null)

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${userId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from("protagonists")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: true,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from("protagonists").getPublicUrl(path)
  return data.publicUrl
}

async function createPollForFavpoll(
  supabase: ReturnType<typeof createAdminClient>,
  favpollId: string,
  userId: string,
  poll: PollInput
) {
  let topicId = poll.topicId
  let customItemIds: string[] = []

  if (!topicId && poll.customTopic) {
    const { data: newTopic, error: topicErr } = await supabase
      .from("topics")
      .insert({
        title: poll.customTopic.title.trim(),
        created_by: userId,
        is_finite: false,
        is_active: true,
        placeholders: {},
      })
      .select("id")
      .single()
    if (topicErr || !newTopic)
      throw new Error(`Failed to create topic: ${topicErr?.message}`)
    topicId = newTopic.id

    const itemsToInsert = poll.customTopic.items
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label) => ({
        topic_id: topicId!,
        label,
        source: "organiser",
        is_canonical: false,
        review_status: "pending_review",
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

  // Organiser additions for canonical topics (wizard pre-publish adds)
  const addedItems = (poll.addedItems ?? [])
    .map((l) => l.trim())
    .filter(Boolean)
  if (!poll.customTopic && addedItems.length > 0) {
    const { data: newAdditions } = await supabase
      .from("favourites")
      .insert(
        addedItems.map((label) => ({
          topic_id: topicId!,
          label,
          source: "organiser",
          is_canonical: false,
          review_status: "pending_review",
        }))
      )
      .select("id")
    const additionIds = (newAdditions ?? []).map((i) => i.id)
    if (additionIds.length > 0) {
      await supabase.from("favpoll_poll_favourites").insert(
        additionIds.map((itemId) => ({
          favpoll_poll_id: favpollPoll.id,
          favourite_id: itemId,
          is_guest_added: false,
          added_by: userId,
        }))
      )
    }
  }

  if (!poll.customTopic && poll.infiniteItems) {
    const { canonicalItemIds, customLabels } = poll.infiniteItems
    const allItemIds = [...canonicalItemIds]

    if (customLabels.length > 0) {
      const { data: newCustomItems } = await supabase
        .from("favourites")
        .insert(
          customLabels.map((label) => ({
            topic_id: topicId!,
            label: label.trim(),
            source: "organiser",
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

export async function createFavpoll(
  input: CreateEventInput
): Promise<{ favpollId: string }> {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()
  await ensureUser(supabase, userId)

  let protagonistId: string | null = null
  if (input.subject === "someone") {
    const protagonistRow: Record<string, unknown> = {
      name: input.protagonistName.trim(),
      about: input.protagonistAbout || null,
      photo_url: input.photoUrl || null,
      context: input.dateLabel || null,
      created_by: userId,
    }
    const { data: protagonist, error: protagonistErr } = await supabase
      .from("protagonists")
      .insert(protagonistRow)
      .select("id")
      .single()
    if (protagonistErr || !protagonist)
      throw new Error(
        `Failed to create protagonist: ${protagonistErr?.message}`
      )
    protagonistId = protagonist.id
  }

  const closesAt = new Date(input.closesAt).toISOString()
  const hardCloseAt = new Date(input.closesAt)
  hardCloseAt.setDate(hardCloseAt.getDate() + 90)

  const { data: event, error: eventErr } = await supabase
    .from("favpolls")
    .insert({
      protagonist_id: protagonistId,
      subject: input.subject,
      cause_label: input.causeLabel,
      category: input.category,
      grouping: input.grouping,
      is_plural: input.grouping !== "individual",
      opening_line: input.openingLine,
      created_by: userId,
      closes_at: closesAt,
      original_closes_at: closesAt,
      hard_close_at: hardCloseAt.toISOString(),
      extension_count: 0,
      is_private: input.isPrivate,
      is_listed: input.isListed,
      description: input.description,
    })
    .select("id")
    .single()

  if (eventErr || !event)
    throw new Error(`Failed to create favpoll: ${eventErr?.message}`)

  if (input.charityIds.length > 0) {
    await supabase.from("favpoll_charities").insert(
      input.charityIds.map((charityId, i) => ({
        favpoll_id: event.id,
        charity_id: charityId,
        display_order: i,
      }))
    )
  }

  await createPollForFavpoll(supabase, event.id, userId, input.poll)

  const { error: potErr } = await supabase.from("favpoll_pots").insert({
    favpoll_id: event.id,
    created_by: userId,
    total_deposited: input.potAmount ?? 0,
  })
  if (potErr) throw new Error(`Failed to create fund: ${potErr?.message}`)

  return { favpollId: event.id }
}
