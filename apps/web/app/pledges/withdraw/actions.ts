"use server"

import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function withdrawPledge(formData: FormData) {
  const token = formData.get("token") as string
  if (!token) return

  const supabase = createAdminClient()

  // Verify pledge still exists, not withdrawn, and favpoll is still open
  const { data: pledge } = await supabase
    .from("pledges")
    .select("id, withdrawn_at, favpoll_polls(favpolls(closes_at, id))")
    .eq("guest_token", token)
    .is("withdrawn_at", null)
    .maybeSingle()

  if (!pledge) redirect("/pledges/withdraw/invalid")

  const favpollData = (pledge.favpoll_polls as any)?.favpolls
  const closesAt = favpollData?.closes_at
  const favpollId = favpollData?.id

  if (closesAt && new Date(closesAt) < new Date()) {
    redirect(`/favpolls/${favpollId}`)
  }

  await supabase
    .from("pledges")
    .update({ withdrawn_at: new Date().toISOString(), guest_token: null })
    .eq("id", pledge.id)

  redirect(`/favpolls/${favpollId}?withdrawn=1`)
}
