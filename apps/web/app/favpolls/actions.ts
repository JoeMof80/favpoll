"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { actionId, parseInput } from "@/lib/action-input"

const NOT_A_FAVPOLL = "That favpoll wasn't recognised."

export async function deleteFavpoll(rawFavpollId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")

  // A DESTRUCTIVE ACTION, so the shape goes first (#1109). Ownership is
  // already checked below and does the real work; this only means the
  // delete runs against an id the column can hold. The action keeps
  // THROWING rather than returning: it ends in redirect(), which Next
  // throws, so it has no caller left to render a result to.
  const favpollId = parseInput(
    actionId(NOT_A_FAVPOLL),
    rawFavpollId,
    "deleteFavpoll"
  )

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
