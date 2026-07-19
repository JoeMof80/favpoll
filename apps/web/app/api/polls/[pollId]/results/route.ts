import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type PollResultItem = {
  label: string
  amountPence: number
  widthPercent: number
}

type ItemRow = { id: string; label: string; all_time_pledged: number | null }

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params
  const supabase = createAdminClient()

  // The standings a pledge reveals are each item's all_time_pledged — the
  // record's number, the same source the poll page's RankingList displays
  // ("reveal its standing") — NOT a per-poll pledge aggregation.
  //
  // Item source mirrors every card surface: a finite topic's items are the
  // topic's closed set (such polls carry no favpoll_poll_favourites rows);
  // an infinite topic's items are its curated epf rows.
  const { data: poll, error: pollErr } = await supabase
    .from("favpoll_polls")
    .select("id, topic_id, topics ( is_finite )")
    .eq("id", pollId)
    .single()

  if (pollErr) {
    return NextResponse.json({ error: pollErr.message }, { status: 500 })
  }

  const isFinite =
    (poll?.topics as unknown as { is_finite: boolean } | null)?.is_finite ??
    false

  let items: ItemRow[] = []
  if (isFinite) {
    const { data, error } = await supabase
      .from("favourites")
      .select("id, label, all_time_pledged")
      .eq("topic_id", poll.topic_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    items = (data ?? []) as ItemRow[]
  } else {
    const { data, error } = await supabase
      .from("favpoll_poll_favourites")
      .select("favourites ( id, label, all_time_pledged )")
      .eq("favpoll_poll_id", pollId)
      .eq("is_hidden", false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    items = (data ?? [])
      .map((row) => row.favourites as unknown as ItemRow | null)
      .filter((f): f is ItemRow => Boolean(f))
  }

  const sorted = items.sort(
    (a, b) =>
      (b.all_time_pledged ?? 0) - (a.all_time_pledged ?? 0) ||
      a.label.localeCompare(b.label)
  )
  const max = sorted[0]?.all_time_pledged ?? 0

  const results: PollResultItem[] = sorted.map((item) => ({
    label: item.label,
    amountPence: Math.round((item.all_time_pledged ?? 0) * 100),
    widthPercent:
      max > 0 ? Math.round(((item.all_time_pledged ?? 0) / max) * 100) : 0,
  }))

  return NextResponse.json({ results })
}
