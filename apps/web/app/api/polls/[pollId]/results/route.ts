import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { pollStandings } from "@/lib/poll-standings"

export type PollResultItem = {
  label: string
  amountPence: number
  widthPercent: number
}

type ItemRow = { id: string; label: string }

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params
  const { userId } = await auth()
  const url = new URL(request.url)
  const guestToken = url.searchParams.get("guest_token")

  const supabase = createAdminClient()

  // The standings a pledge reveals are THIS poll's pledge sums — the bars
  // must agree with the favpoll's raised figure (lib/poll-standings). The
  // all-time record lives on /record.
  //
  // Item source mirrors every card surface: a finite topic's items are the
  // topic's closed set (such polls carry no favpoll_poll_favourites rows);
  // an infinite topic's items are its curated epf rows.
  const { data: poll, error: pollErr } = await supabase
    .from("favpoll_polls")
    .select("id, topic_id, favpoll_id, topics ( is_finite )")
    .eq("id", pollId)
    .single()

  if (pollErr) {
    return NextResponse.json({ error: pollErr.message }, { status: 500 })
  }

  // Entitlement — the same gate as the reveal route: an open poll's
  // standings sit behind the pledge lock, so only a viewer who pledged
  // (signed-in or via guest token) may read them; closed polls are public.
  // Without this, anyone could curl the standings and bypass the lock.
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

  const isFinite =
    (poll?.topics as unknown as { is_finite: boolean } | null)?.is_finite ??
    false

  let items: ItemRow[] = []
  if (isFinite) {
    const { data, error } = await supabase
      .from("favourites")
      .select("id, label")
      .eq("topic_id", poll.topic_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    items = (data ?? []) as ItemRow[]
  } else {
    const { data, error } = await supabase
      .from("favpoll_poll_favourites")
      .select("favourites ( id, label )")
      .eq("favpoll_poll_id", pollId)
      .eq("is_hidden", false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    items = (data ?? [])
      .map((row) => row.favourites as unknown as ItemRow | null)
      .filter((f): f is ItemRow => Boolean(f))
  }

  const { totals } = await pollStandings(supabase, pollId)

  const merged = items.map((item) => ({
    label: item.label,
    total: totals.get(item.id) ?? 0,
  }))

  const sorted = merged.sort(
    (a, b) => b.total - a.total || a.label.localeCompare(b.label)
  )
  const max = sorted[0]?.total ?? 0

  const results: PollResultItem[] = sorted.map((item) => ({
    label: item.label,
    amountPence: Math.round(item.total * 100),
    widthPercent: max > 0 ? Math.round((item.total / max) * 100) : 0,
  }))

  return NextResponse.json({ results })
}
