// @vitest-environment node
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params
  const { userId } = await auth()
  const url = new URL(request.url)
  const guestToken = url.searchParams.get("guest_token")

  const supabase = createAdminClient()

  // Resolve poll → favpoll to check closed status
  const { data: poll } = await supabase
    .from("favpoll_polls")
    .select("personal_reveal, topic_id, favpoll_id")
    .eq("id", pollId)
    .single()

  if (!poll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data: favpollRow } = await supabase
    .from("favpolls")
    .select("closed_at, closes_at")
    .eq("id", poll.favpoll_id)
    .single()

  const isClosed =
    !!favpollRow?.closed_at ||
    (favpollRow ? new Date(favpollRow.closes_at) < new Date() : false)

  let entitled = isClosed

  if (!entitled && userId) {
    const { data } = await supabase
      .from("pledges")
      .select("id")
      .eq("favpoll_poll_id", pollId)
      .eq("clerk_user_id", userId)
      .is("withdrawn_at", null)
      .limit(1)
    entitled = (data?.length ?? 0) > 0
  }

  if (!entitled && guestToken) {
    const { data } = await supabase
      .from("pledges")
      .select("id")
      .eq("favpoll_poll_id", pollId)
      .eq("guest_token", guestToken)
      .is("withdrawn_at", null)
      .limit(1)
    entitled = (data?.length ?? 0) > 0
  }

  if (!entitled) {
    return NextResponse.json({ error: "Not entitled" }, { status: 403 })
  }

  const { data: items } = await supabase
    .from("favourites")
    .select("*")
    .eq("topic_id", poll.topic_id)

  return NextResponse.json({
    personal_reveal: poll.personal_reveal ?? null,
    items: items ?? [],
  })
}
