// @vitest-environment node
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchPollItems } from "@/lib/poll-items"
import { pollStandings, overlayStandings } from "@/lib/poll-standings"

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
    .select("personal_reveal, topic_id, favpoll_id, topics ( is_finite )")
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

  // The guest's post-pledge item list must match the poll page's rule
  // exactly: this poll's items (lib/poll-items — an infinite topic shows
  // its curated rows, never the whole topic canon), with THIS POLL's
  // pledge sums overlaid onto the all_time_* fields (lib/poll-standings).
  // The previous raw `favourites` select leaked the all-time record onto a
  // guest's bars — a fresh poll showed £1.2K rankings after one pledge.
  const isFinite =
    (poll.topics as unknown as { is_finite: boolean } | null)?.is_finite ??
    false

  const [rawItems, standings] = await Promise.all([
    fetchPollItems(supabase, {
      pollId,
      topicId: poll.topic_id,
      isFinite,
    }),
    pollStandings(supabase, pollId),
  ])

  return NextResponse.json({
    personal_reveal: poll.personal_reveal ?? null,
    items: overlayStandings(rawItems, standings),
  })
}
