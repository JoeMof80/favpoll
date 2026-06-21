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
    .from("favpoll_poll_favourites")
    .select(
      "favpoll_poll_id, favpoll_polls!inner(favpoll_id, favpolls!inner(id, created_by))"
    )
    .eq("id", eventPollItemId)
    .single()

  if (error || !data) throw new Error("Favpoll poll favourite not found")

  const favpollData = (data as any).favpoll_polls?.favpolls
  if (favpollData?.created_by !== userId) {
    throw new Error(
      "Not authorised — you are not the organiser of this favpoll"
    )
  }

  return favpollData.id as string
}

export async function hideFavpollPollFavourite(eventPollItemId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const favpollId = await verifyOrganiser(eventPollItemId, userId)

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("favpoll_poll_favourites")
    .update({
      is_hidden: true,
      hidden_at: new Date().toISOString(),
      hidden_by: userId,
    })
    .eq("id", eventPollItemId)

  if (error) throw new Error(error.message)

  revalidatePath(`/favpolls/${favpollId}`)
}

export async function showFavpollPollFavourite(eventPollItemId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const favpollId = await verifyOrganiser(eventPollItemId, userId)

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("favpoll_poll_favourites")
    .update({
      is_hidden: false,
      hidden_at: null,
      hidden_by: null,
    })
    .eq("id", eventPollItemId)

  if (error) throw new Error(error.message)

  revalidatePath(`/favpolls/${favpollId}`)
}
