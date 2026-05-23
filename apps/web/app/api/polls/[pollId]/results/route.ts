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

  // pledge_allocations has no event_poll_id — must join through pledges
  const { data: pledges, error: pledgeErr } = await supabase
    .from("pledges")
    .select("id")
    .eq("event_poll_id", pollId)

  if (pledgeErr) {
    return NextResponse.json({ error: pledgeErr.message }, { status: 500 })
  }

  const pledgeIds = (pledges ?? []).map((p) => p.id)
  if (pledgeIds.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const { data: allocations, error: allocErr } = await supabase
    .from("pledge_allocations")
    .select("topic_item_id, amount, topic_items ( label )")
    .in("pledge_id", pledgeIds)

  if (allocErr) {
    return NextResponse.json({ error: allocErr.message }, { status: 500 })
  }

  // Aggregate by topic item
  const totals = new Map<string, { label: string; total: number }>()
  for (const row of allocations ?? []) {
    const label = (row.topic_items as unknown as { label: string } | null)?.label
    if (!label) continue
    const prev = totals.get(row.topic_item_id) ?? { label, total: 0 }
    totals.set(row.topic_item_id, { label, total: prev.total + (row.amount ?? 0) })
  }

  const sorted = [...totals.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const max = sorted[0]?.total ?? 0

  const results: PollResultItem[] = sorted.map((item) => ({
    label: item.label,
    amountPence: Math.round(item.total * 100),
    widthPercent: max > 0 ? Math.round((item.total / max) * 100) : 0,
  }))

  return NextResponse.json({ results })
}
