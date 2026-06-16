"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function deleteEvent(eventId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  // Verify ownership before deleting
  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("id")
    .eq("id", eventId)
    .eq("created_by", userId)
    .single()

  if (!favpoll) throw new Error("Favpoll not found or not yours")

  const { error } = await supabase.from("favpolls").delete().eq("id", eventId)
  if (error) throw new Error(error.message)

  redirect("/favpolls")
}
