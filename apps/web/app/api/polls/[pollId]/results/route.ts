import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type PollResultItem = {
  label: string
  amountPence: number
  widthPercent: number
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params
  const supabase = createAdminClient()

  // pledge_allocations has no favpoll_poll_id — must join through pledges
  // Fetch all visible items in the poll
  const { data: pollItems, error: pollItemsErr } = await supabase
    .from("favpoll_poll_favourites")
    .select("favourite_id, favourites ( label )")
    .eq("favpoll_poll_id", pollId)
    .eq("is_hidden", false)

  if (pollItemsErr) {
    return NextResponse.json({ error: pollItemsErr.message }, { status: 500 })
  }

  if (!pollItems || pollItems.length === 0) {
    return NextResponse.json({ results: [] })
  }

  // Build a label map for all poll items
  const labelMap = new Map<string, string>()
  for (const row of pollItems) {
    const label = (row.favourites as unknown as { label: string } | null)?.label
    if (label) labelMap.set(row.favourite_id, label)
  }

  // Aggregate pledged amounts
  const { data: pledges } = await supabase
    .from("pledges")
    .select("id")
    .eq("favpoll_poll_id", pollId)
    .is("withdrawn_at", null)

  const pledgeIds = (pledges ?? []).map((p) => p.id)
  const totals = new Map<string, number>()

  if (pledgeIds.length > 0) {
    const { data: allocations, error: allocErr } = await supabase
      .from("pledge_allocations")
      .select("favourite_id, amount")
      .in("pledge_id", pledgeIds)

    if (allocErr) {
      return NextResponse.json({ error: allocErr.message }, { status: 500 })
    }

    for (const row of allocations ?? []) {
      totals.set(
        row.favourite_id,
        (totals.get(row.favourite_id) ?? 0) + (row.amount ?? 0)
      )
    }
  }

  // Merge: all poll items, using pledge totals where available
  const merged = [...labelMap.entries()].map(([id, label]) => ({
    label,
    total: totals.get(id) ?? 0,
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
