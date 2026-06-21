"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function deleteFavpoll(favpollId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  const supabase = createAdminClient()

  // Verify ownership before deleting
  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("id")
    .eq("id", favpollId)
    .eq("created_by", userId)
    .single()

  if (!favpoll) throw new Error("Favpoll not found or not yours")

  const { error } = await supabase.from("favpolls").delete().eq("id", favpollId)
  if (error) throw new Error(error.message)

  redirect("/favpolls")
}
