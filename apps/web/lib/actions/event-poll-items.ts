"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

async function verifyOrganiser(
  eventPollItemId: string,
  userId: string
): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("event_poll_items")
    .select(
      "event_poll_id, event_polls!inner(event_id, events!inner(id, created_by))"
    )
    .eq("id", eventPollItemId)
    .single()

  if (error || !data) throw new Error("Event poll item not found")

  const eventData = (data as any).event_polls?.events
  if (eventData?.created_by !== userId) {
    throw new Error("Not authorised — you are not the organiser of this event")
  }

  return eventData.id as string
}

export async function hideEventPollItem(eventPollItemId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const eventId = await verifyOrganiser(eventPollItemId, userId)

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("event_poll_items")
    .update({
      is_hidden: true,
      hidden_at: new Date().toISOString(),
      hidden_by: userId,
    })
    .eq("id", eventPollItemId)

  if (error) throw new Error(error.message)

  revalidatePath(`/events/${eventId}`)
}

export async function showEventPollItem(eventPollItemId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const eventId = await verifyOrganiser(eventPollItemId, userId)

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("event_poll_items")
    .update({
      is_hidden: false,
      hidden_at: null,
      hidden_by: null,
    })
    .eq("id", eventPollItemId)

  if (error) throw new Error(error.message)

  revalidatePath(`/events/${eventId}`)
}
